# Claude Code Status Line

A compact, color-coded status line for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) that shows everything you need at a glance.

```
[Opus 4.6 (1M context)] active ▓▓░░░░░░ 12% 45k · 5h ▓▓▓▓▓▓▓░ 98% ↻2m · 7d ▓▓░░░░░░ 19% · $0.29
```

## What it shows

| Section | Description |
|---------|-------------|
| `[Opus 4.6 (1M context)]` | Current model |
| `active` | Session state: `new`, `active`, `loaded` (resumed with context), `resumed` |
| `▓▓░░░░░░ 12% 45k` | Context window usage with progress bar and token count |
| `5h ▓▓▓▓▓▓▓░ 98% ↻2m` | 5-hour rate limit usage + time until reset (Max/Pro only) |
| `7d ▓▓░░░░░░ 19%` | 7-day rate limit usage (Max/Pro only) |
| `$0.29` | Session cost (API) or equivalent cost (Max/Pro) |

Colors change automatically: **green** (< 50%) → **yellow** (50-79%) → **red** (80%+).

## Install

### 1. Copy the script

```bash
# Linux/macOS
cp statusline.js ~/.claude/statusline.js

# Windows (Git Bash / MSYS2)
cp statusline.js ~/.claude/statusline.js
```

Or download directly:

```bash
curl -o ~/.claude/statusline.js https://raw.githubusercontent.com/javiereaw/claude-code-statusline/main/statusline.js
```

### 2. Configure Claude Code

Add to your `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/statusline.js"
  }
}
```

That's it. Restart Claude Code and you'll see the status line.

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (CLI, desktop app, or IDE extension)
- Node.js (any version that ships with Claude Code works)
- `jq` is **not** required — this is pure JavaScript

## Session states explained

| State | Meaning |
|-------|---------|
| `new` | Fresh conversation, just started |
| `active` | Ongoing conversation |
| `loaded` | Session resumed with prior context (> 5% context used on start) |
| `resumed` | Continuing a session that was previously active |

## Customization

The script is a single file — fork it, tweak it. Some ideas:

- Change `bar(pct, 8)` to `bar(pct, 12)` for wider progress bars
- Edit the `colorFor()` function to change threshold percentages
- Remove the cost section if you don't want it
- Change `sessionTag` labels to whatever you prefer

## License

MIT
