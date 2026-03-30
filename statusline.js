#!/usr/bin/env node
// Claude Code Status Line
// Shows: model, session state, context usage, Max subscription limits, API cost
// https://github.com/javiereaw/claude-code-statusline

const fs = require('fs');
const os = require('os');
const path = require('path');

const SESSION_FILE = path.join(os.tmpdir(), 'claude-code-session.json');
const RST = '\x1b[0m';

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => raw += chunk);
process.stdin.on('end', () => {
  try {
    const d = JSON.parse(raw);
    const parts = [];

    // Model name (clean)
    const model = (d.model?.display_name || d.model?.id || '?')
      .replace(/^Claude\s+/i, '')
      .replace(/\s+\d{4}-\d{2}-\d{2}$/, '');

    // Session freshness: track session_id in temp file
    const sessionId = d.session_id || '';
    let sessionTag = 'new';
    try {
      const prev = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
      if (prev.id === sessionId) {
        sessionTag = prev.resumed ? 'resumed' : 'active';
      } else {
        const ctxUsed = d.context_window?.used_percentage || 0;
        sessionTag = ctxUsed > 5 ? 'loaded' : 'new';
      }
    } catch { /* first run or missing file */ }
    try {
      const ctxNow = d.context_window?.used_percentage || 0;
      fs.writeFileSync(SESSION_FILE, JSON.stringify({
        id: sessionId,
        resumed: ctxNow > 5,
        ts: Date.now()
      }));
    } catch { /* ignore write errors */ }

    // Context bar
    const ctxPct = Math.round(d.context_window?.used_percentage || 0);
    const total = (d.context_window?.total_input_tokens || 0)
                + (d.context_window?.total_output_tokens || 0);
    const tok = total >= 1e6 ? (total / 1e6).toFixed(1) + 'M'
              : total >= 1e3 ? Math.floor(total / 1e3) + 'k'
              : total + 't';

    parts.push(`${colorFor(ctxPct)}[${model}] ${sessionTag} ${bar(ctxPct)} ${ctxPct}% ${tok}${RST}`);

    // Rate limits (Max/Pro subscription)
    const rl = d.rate_limits;
    if (rl?.five_hour) {
      const p = Math.round(rl.five_hour.used_percentage || 0);
      const t = rl.five_hour.resets_at ? ' \u21bb' + timeUntil(rl.five_hour.resets_at) : '';
      parts.push(`${colorFor(p)}5h ${bar(p)} ${p}%${t}${RST}`);
    }
    if (rl?.seven_day) {
      const p = Math.round(rl.seven_day.used_percentage || 0);
      parts.push(`${colorFor(p)}7d ${bar(p)} ${p}%${RST}`);
    }

    // Cost (useful for API users; shows equivalent cost for Max users)
    const cost = d.cost?.total_cost_usd;
    if (cost != null && cost > 0) {
      parts.push(`$${cost < 1 ? cost.toFixed(2) : cost.toFixed(1)}`);
    }

    process.stdout.write(parts.join(' \u00b7 '));
  } catch {
    process.stdout.write('[statusline error]');
  }
});

function bar(pct, width = 8) {
  const filled = Math.min(Math.round(pct * width / 100), width);
  return '\u2593'.repeat(filled) + '\u2591'.repeat(width - filled);
}

function colorFor(pct) {
  if (pct >= 80) return '\x1b[31m'; // red
  if (pct >= 50) return '\x1b[33m'; // yellow
  return '\x1b[32m';                // green
}

function timeUntil(epochSec) {
  const diff = epochSec - Math.floor(Date.now() / 1000);
  if (diff <= 0) return 'reset!';
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}m` : `${m}m`;
}
