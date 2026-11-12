import { lint } from "slop-police/testing";
import { expect, test } from "vitest";
import { noAnyAssertion } from "./no-any-assertion.ts";

const message =
  "Use a concrete type or narrow the value instead of asserting it to any";

test("reports as any and <any> assertions", () => {
  const source = `declare const x: unknown;
export const a = x as any;
export const b = <any>x;
export const c = (x as any).foo;
export const d = x as any[];
export const e = x as unknown as string;
`;
  expect(lint(noAnyAssertion, source)).toEqual([
    { file: "index.ts", line: 2, column: 18, message },
    { file: "index.ts", line: 3, column: 18, message },
    { file: "index.ts", line: 4, column: 19, message },
  ]);
});
