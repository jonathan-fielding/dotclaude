// Puts a dim "sent HH:MM:SS" line under each of your messages. Under, not
// above: the engine draws a blank line above a message row, so a stamp above
// it would sit against the previous reply instead of the message.
//
// A message is stamped the first time it is drawn, which is when you send it.
// The stamp is remembered by the row's requestId, so redraws and resizes keep
// it. Rows from before the module loaded (a resumed session, a hot reload) get
// stamped with the load time, since the engine doesn't hand us the real one.
import type { Register } from "claude-code";

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export const clockTime = (ms: number) => {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const register: Register = (on) => {
  const sentAt = new Map<string, string>();

  on("ui.render", { component: "UserMessage" }, async ($, e, next) => {
    let stamp = sentAt.get(e.requestId);
    if (stamp === undefined) {
      stamp = clockTime(await $.clock.now()); // resolves a Promise<number>
      sentAt.set(e.requestId, stamp);
    }
    const row = await next(e);
    const { Box, Text } = $.ui.resolve(e);
    return (
      <Box flexDirection="column">
        {row}
        <Text dimColor>{`sent ${stamp}`}</Text>
      </Box>
    );
  });
};
