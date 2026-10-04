import type { On, PromptOrigin } from "claude-code";
import { describe, test, expect, mock } from "claude-code/testing";
import { stampText } from "./register.tsx";

// 4 Oct 2026 is a Sunday.
const at = (day: number, h: number, m: number, s = 0) => new Date(2026, 9, day, h, m, s).getTime();

// Stands in for the engine's own drawing of the message row.
const plainRow = (on: On) =>
  on("ui.render", { component: "UserMessage" }, ($, e) => {
    const { Text } = $.ui.resolve(e);
    return <Text>{e.props.text}</Text>;
  });

const mountMessage = (
  $: Parameters<Parameters<typeof test>[1]>[0],
  requestId: string,
  origin: PromptOrigin = { kind: "composer" },
) =>
  $.ui.mount({
    plugin: "message-time",
    surface: "terminal",
    component: "UserMessage",
    requestId,
    props: { text: "hi", origin, isExpanded: true },
  });

const stampOf = async (ui: Awaited<ReturnType<typeof mountMessage>>) =>
  (await ui.find({ type: "Text", text: /^sent / }))?.text;

describe("stampText", () => {
  test("is HH:MM, zero padded", () => {
    expect(stampText(at(4, 7, 3, 9), false)).toBe("07:03");
  });
  test("carries the day and date when asked", () => {
    expect(stampText(at(5, 9, 12), true)).toBe("Mon 5 Oct, 09:12");
  });
});

describe("message rows", () => {
  test("show the time under the message, indented to its text", async ($, on) => {
    plainRow(on);
    mock.clock(on, { now: at(4, 19, 4, 5) });
    const ui = await mountMessage($, "a");
    const lines = (await ui.findAll({ type: "Text" })).map((t) => t.text);
    expect(lines).toEqual(["hi", "sent 19:04"]);
    const indented = (await ui.findAll({ type: "Box" })).filter((b) => b.props.marginLeft === 2);
    expect(indented).toHaveLength(1);
    await ui.unmount();
  });

  test("keep their stamp across redraws, while new ones get their own", async ($, on) => {
    plainRow(on);
    const clock = mock.clock(on, { now: at(4, 9, 0) });
    const first = await mountMessage($, "a");
    await clock.advance(90_000);
    await first.redraw();
    expect(await stampOf(first)).toBe("sent 09:00");

    const second = await mountMessage($, "b");
    expect(await stampOf(second)).toBe("sent 09:01");
    await first.unmount();
    await second.unmount();
  });

  test("show the date on the first message of a new day only", async ($, on) => {
    plainRow(on);
    const clock = mock.clock(on, { now: at(4, 23, 58) });
    const late = await mountMessage($, "a");
    expect(await stampOf(late)).toBe("sent 23:58");

    await clock.set(at(5, 0, 1));
    const nextDay = await mountMessage($, "b");
    expect(await stampOf(nextDay)).toBe("sent Mon 5 Oct, 00:01");

    await clock.advance(60_000);
    const sameDay = await mountMessage($, "c");
    expect(await stampOf(sameDay)).toBe("sent 00:02");
    for (const ui of [late, nextDay, sameDay]) await ui.unmount();
  });

  test("stamp messages sent from Remote Control too", async ($, on) => {
    plainRow(on);
    mock.clock(on, { now: at(4, 12, 0) });
    const ui = await mountMessage($, "a", { kind: "bridge" } as PromptOrigin);
    expect(await stampOf(ui)).toBe("sent 12:00");
    await ui.unmount();
  });

  test("leave rows you didn't send alone", async ($, on) => {
    plainRow(on);
    mock.clock(on, { now: at(4, 12, 0) });
    const ui = await mountMessage($, "a", { kind: "unclassified" } as PromptOrigin);
    expect(await stampOf(ui)).toBeUndefined();
    expect((await ui.findAll({ type: "Text" })).map((t) => t.text)).toEqual(["hi"]);
    await ui.unmount();
  });
});
