import { lint } from "slop-police/testing";
import { expect, test } from "vitest";
import { noPxLengths } from "./no-px-lengths.ts";

const px =
  "Use rem or Tailwind spacing instead of px over 2px, so the UI scales with the text size setting";
const iconSize =
  "Size icons with a size-* class instead of a pixel size prop, so they scale with the text size setting";

test("reports px over 2px in strings and templates", () => {
  const source = `declare const x: number;
export const a = "mt-[10px]";
export const b = "border-[2px]";
export const c = "w-[2.5px]";
export const d = "h-[0.5px] w-[03px]";
export const e = "(min-width: 600px)";
export const f = "calc(10px_-_var(--offset))";
export const g = "p-10px 12pxs";
export const h = \`gap-[12px] \${x}\`;
export const i = \`translate-x-[\${x}px]\`;
export const j = \`(max-width: 900px) \${"14px"}\`;
export const k = \`-12px\`;
`;
  expect(lint(noPxLengths, source)).toEqual([
    { file: "index.ts", line: 2, column: 18, message: px },
    { file: "index.ts", line: 4, column: 18, message: px },
    { file: "index.ts", line: 5, column: 18, message: px },
    { file: "index.ts", line: 7, column: 18, message: px },
    { file: "index.ts", line: 9, column: 18, message: px },
    { file: "index.ts", line: 11, column: 40, message: px },
    { file: "index.ts", line: 12, column: 18, message: px },
  ]);
});

test("reports pixel size props on icons and svg elements", () => {
  const source = `declare const Icon: (props: object) => null;
declare const motion: { svg: (props: object) => null };
declare const size: number;
export const a = <Icon size={24} />;
export const b = <Icon size="16" />;
export const c = <Icon size={2} />;
export const d = <Icon size={size} />;
export const e = <svg width={24} height="24" viewBox="0 0 24 24" />;
export const f = <motion.svg width={20}></motion.svg>;
export const g = <div width={30} />;
export const h = <Icon aria-hidden />;
`;
  expect(lint(noPxLengths, { "index.tsx": source })).toEqual([
    { file: "index.tsx", line: 4, column: 24, message: iconSize },
    { file: "index.tsx", line: 5, column: 24, message: iconSize },
    { file: "index.tsx", line: 8, column: 23, message: iconSize },
    { file: "index.tsx", line: 8, column: 34, message: iconSize },
    { file: "index.tsx", line: 9, column: 30, message: iconSize },
  ]);
});

test("reports pixel lengths in style objects", () => {
  const source = `declare const compact: boolean;
export const a = <div style={{ width: 10, height: 2, marginTop: "12", color: "red" }} />;
export const b = <div style={{ ...(compact ? { padding: 8 } : {}) }} />;
export const c = <div style={{ zIndex: 10, fontSize: 1.5 }} />;
export const d = { width: 10 };
`;
  expect(lint(noPxLengths, { "index.tsx": source })).toEqual([
    { file: "index.tsx", line: 2, column: 32, message: px },
    { file: "index.tsx", line: 2, column: 54, message: px },
    { file: "index.tsx", line: 3, column: 48, message: px },
  ]);
});

test("checks only the files under onlyIn", () => {
  const files = {
    "src/app.tsx": `export const a = "mt-[10px]";\n`,
    "server/email.ts": `export const a = "mt-[10px]";\n`,
  };
  expect(lint(noPxLengths, files, { onlyIn: "src/" })).toEqual([
    { file: "src/app.tsx", line: 1, column: 18, message: px },
  ]);
});
