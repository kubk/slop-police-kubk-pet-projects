import { lint } from "slop-police/testing";
import { expect, test } from "vitest";
import { noAriaAttributes } from "./no-aria-attributes.ts";

const message = "Do not add aria attributes";

test("reports aria attributes on elements and components", () => {
  const source = `declare const Icon: (props: object) => null;
declare const motion: { div: (props: object) => null };
export const a = <div aria-label="Close" />;
export const b = <Icon aria-hidden />;
export const c = <motion.div aria-live="polite" />;
export const d = <div data-aria="x" role="button" />;
export const e = <div {...{ "aria-label": "spread" }} />;
`;
  expect(lint(noAriaAttributes, { "index.tsx": source })).toEqual([
    { file: "index.tsx", line: 3, column: 23, message },
    { file: "index.tsx", line: 4, column: 24, message },
    { file: "index.tsx", line: 5, column: 30, message },
  ]);
});
