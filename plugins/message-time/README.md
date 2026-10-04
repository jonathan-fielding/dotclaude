# message-time

Shows when you sent each message, as a dim line under it in the transcript:

```
> can you add a test for this
  sent 19:04
```

The first message of a new day carries the date too (`sent Mon 5 Oct, 09:12`).
Only messages you send get a stamp, typed or from Remote Control; task
notifications and messages from other agents don't.

It's a function hook, which is early access, so start Claude Code with:

```sh
CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude
```

Messages are stamped when they're first drawn, so in a resumed session the
older messages show the time the session resumed, not when they were sent.

Run the tests with `claude plugin test plugins/message-time`.

## Credit

Inspired by the `time` plugin in
[diegorv/claude-functions-hook](https://github.com/diegorv/claude-functions-hook/tree/main/plugins/time).
This is an independent implementation, not a copy of that code.
