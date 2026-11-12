import { lint } from "slop-police/testing";
import { expect, test } from "vitest";
import { noRedundantCn } from "./no-redundant-cn.ts";

const message = "Use the class string directly instead of cn";

test("reports cn with a single string or template argument", () => {
  const source = `declare function cn(...inputs: unknown[]): string;
declare const lib: { cn: typeof cn };
declare const x: string;
export const a = cn("p-4");
export const b = cn('p-4');
export const c = cn(\`p-4\`);
export const d = cn(\`p-\${x}\`);
export const e = cn("p-4", x);
export const f = cn(x);
export const g = cn();
export const h = lib.cn("p-4");
`;
  expect(lint(noRedundantCn, source)).toEqual([
    { file: "index.ts", line: 4, column: 18, message },
    { file: "index.ts", line: 5, column: 18, message },
    { file: "index.ts", line: 6, column: 18, message },
    { file: "index.ts", line: 7, column: 18, message },
  ]);
});
