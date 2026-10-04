import type { On } from "claude-code";
import { describe, test, expect, mock } from "claude-code/testing";
import { clockTime } from "./register.tsx";

const at = (h: number, m: number, s: number) => new Date(2026, 9, 4, h, m, s).getTime();

// Stands in for the engine's own drawing of the message row.
const plainRow = (on: On) =>
  on("ui.render", { component: "UserMessage" }, ($, e) => {
    const { Text } = $.ui.resolve(e);
    return <Text>{e.props.text}</Text>;
  });

const mountMessage = ($: Parameters<Parameters<typeof test>[1]>[0], requestId: string) =>
  $.ui.mount({
    plugin: "message-time",
    surface: "terminal",
    component: "UserMessage",
    requestId,
    props: { text: "hi", origin: { kind: "composer" }, isExpanded: true },
  });

const stampOf = async (ui: Awaited<ReturnType<typeof mountMessage>>) =>
  (await ui.find({ type: "Text", text: /^sent / }))?.text;

describe("clockTime", () => {
  test("pads each field to two digits", () => {
    expect(clockTime(at(7, 3, 9))).toBe("07:03:09");
    expect(clockTime(at(23, 59, 59))).toBe("23:59:59");
  });
});

describe("message rows", () => {
  test("show the time the message was sent, under the message", async ($, on) => {
    plainRow(on);
    mock.clock(on, { now: at(19, 4, 5) });
    const ui = await mountMessage($, "a");
    const lines = (await ui.findAll({ type: "Text" })).map((t) => t.text);
    expect(lines).toEqual(["hi", "sent 19:04:05"]);
    await ui.unmount();
  });

  test("keep their stamp across redraws, while new ones get their own", async ($, on) => {
    plainRow(on);
    const clock = mock.clock(on, { now: at(9, 0, 0) });
    const first = await mountMessage($, "a");
    await clock.advance(90_000);
    await first.redraw();
    expect(await stampOf(first)).toBe("sent 09:00:00");

    const second = await mountMessage($, "b");
    expect(await stampOf(second)).toBe("sent 09:01:30");
    await first.unmount();
    await second.unmount();
  });
});
