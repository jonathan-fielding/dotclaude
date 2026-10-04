// Puts a dim "sent HH:MM" line under each message you send. Under, not
// above: the engine draws a blank line above a message row, so a stamp above
// it would sit against the previous reply instead of the message.
//
// A message is stamped the first time it is drawn, which is when you send it.
// The stamp is remembered by the row's requestId, so redraws and resizes keep
// it. Rows from before the module loaded (a resumed session, a hot reload) get
// stamped with the load time, since the engine doesn't hand us the real one.
import type { Register } from "claude-code";

// Origins that are you: typed at the prompt, or sent from Remote Control.
// Task notifications, peers, channels and the rest aren't "sent" by you.
const YOURS = new Set(["composer", "bridge"]);

// Lines the stamp up with the message text, past the engine's "> " marker.
const INDENT = 2;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const dayOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// "19:04", or "Mon 5 Oct, 09:12" when `withDate`.
export const stampText = (ms: number, withDate: boolean) => {
  const d = new Date(ms);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return withDate ? `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}, ${time}` : time;
};

export const register: Register = (on) => {
  const sentAt = new Map<string, string>();
  let lastDay: string | undefined; // the day of the last message stamped

  on("ui.render", { component: "UserMessage" }, async ($, e, next) => {
    if (!YOURS.has(e.props.origin.kind)) return next(e);

    let stamp = sentAt.get(e.requestId);
    if (stamp === undefined) {
      const now = await $.clock.now(); // resolves a Promise<number>
      const day = dayOf(new Date(now));
      // The date shows on the first message of a new day, not the session's first.
      stamp = stampText(now, lastDay !== undefined && day !== lastDay);
      lastDay = day;
      sentAt.set(e.requestId, stamp);
    }

    const row = await next(e);
    const { Box, Text } = $.ui.resolve(e);
    return (
      <Box flexDirection="column">
        {row}
        <Box marginLeft={INDENT}>
          <Text dimColor>{`sent ${stamp}`}</Text>
        </Box>
      </Box>
    );
  });
};
