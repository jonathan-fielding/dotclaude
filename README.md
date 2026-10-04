# dotclaude

Skills, mods and other bits I use with Claude Code.

## Structure

```
.claude-plugin/
  plugin.json        # Plugin manifest
  marketplace.json   # Lets this repo be added as a marketplace
commands/            # Slash commands (/hello)
agents/              # Subagents
skills/              # Skills (one folder per skill, each with SKILL.md)
hooks/hooks.json     # Hook configuration
scripts/             # Scripts referenced by hooks
plugins/message-time/ # Function hook: when each message was sent
```

## Local development

Run Claude Code with the plugin loaded straight from this directory:

```sh
claude --plugin-dir .
```

Validate the manifests:

```sh
claude plugin validate .
```

## Install

From inside Claude Code:

```
/plugin marketplace add jonathan-fielding/dotclaude
/plugin install dotclaude@jonathan-fielding
/plugin install message-time@jonathan-fielding
```

`message-time` is a function hook, so start Claude Code with
`CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1`.
