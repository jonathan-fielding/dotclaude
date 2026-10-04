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
/plugin marketplace add <github-user>/<repo>
/plugin install dotclaude@jonathan-fielding
```
