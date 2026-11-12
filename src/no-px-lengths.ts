import {
  defineRule,
  isIdentifier,
  isJsxAttribute,
  isJsxExpression,
  isJsxOpeningElement,
  isJsxSelfClosingElement,
  isNumericLiteral,
  isPropertyAccessExpression,
  isStringLiteral,
  type Node,
  type RuleContext,
} from "slop-police";

type Options = {
  // Path prefix, relative to slop-police.json, of the files to check
  onlyIn: string;
};

// Lengths up to 2px are hairlines (borders, outlines) and stay crisp in px
const MAX_HAIRLINE_PX = 2;
const pxPattern = /(?<![A-Za-z0-9.-])-?(\d*\.?\d+)px(?![A-Za-z0-9-])/g;
// Media queries resolve rem against the browser default, not the text size setting
const mediaQueryPattern = /\((?:min|max)-(?:width|height):/;
const lengthStyleKeys = new Set([
  "width",
  "height",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "top",
  "right",
  "bottom",
  "left",
  "inset",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "gap",
  "fontSize",
  "borderRadius",
]);
const pxMessage =
  "Use rem or Tailwind spacing instead of px over 2px, so the UI scales with the text size setting";
const iconSizeMessage =
  "Size icons with a size-* class instead of a pixel size prop, so they scale with the text size setting";

function hasScalablePx(text: string) {
  if (mediaQueryPattern.test(text)) {
    return false;
  }
  for (const match of text.matchAll(pxPattern)) {
    if (Number(match[1]) > MAX_HAIRLINE_PX) {
      return true;
    }
  }
  return false;
}

function getNumericValue(node: Node | undefined): number | null {
  if (node === undefined) {
    return null;
  }
  if (isJsxExpression(node)) {
    return getNumericValue(node.expression);
  }
  if (isNumericLiteral(node)) {
    return Number(node.text);
  }
  if (isStringLiteral(node) && /^\d*\.?\d+$/.test(node.text)) {
    return Number(node.text);
  }
  return null;
}

function getJsxName(node: Node): string | null {
  if (isIdentifier(node)) {
    return node.text;
  }
  if (isPropertyAccessExpression(node)) {
    return `${getJsxName(node.expression)}.${node.name.text}`;
  }
  return null;
}

function isInStyleAttribute(node: Node) {
  for (
    let parent: Node | undefined = node.parent;
    parent;
    parent = parent.parent
  ) {
    if (
      isJsxAttribute(parent) &&
      isIdentifier(parent.name) &&
      parent.name.text === "style"
    ) {
      return true;
    }
  }
  return false;
}

function isChecked(ctx: RuleContext<Options>) {
  return ctx.file.path.startsWith(ctx.options.onlyIn);
}

function checkText(node: Node, text: string, ctx: RuleContext<Options>) {
  if (isChecked(ctx) && hasScalablePx(text)) {
    ctx.report(node, pxMessage);
  }
}

export const noPxLengths = defineRule<Options>({
  name: "no-px-lengths",
  options: { onlyIn: "" },
  visit: {
    StringLiteral(node, ctx) {
      checkText(node, node.text, ctx);
    },
    NoSubstitutionTemplateLiteral(node, ctx) {
      checkText(node, node.text, ctx);
    },
    TemplateExpression(node, ctx) {
      const quasis = [
        node.head,
        ...node.templateSpans.map((span) => span.literal),
      ];
      checkText(node, quasis.map((quasi) => quasi.text).join(" "), ctx);
    },
    JsxAttribute(node, ctx) {
      if (!isChecked(ctx) || !isIdentifier(node.name)) {
        return;
      }
      const value = getNumericValue(node.initializer);
      if (value === null || value <= MAX_HAIRLINE_PX) {
        return;
      }
      const attribute = node.name.text;
      const element = node.parent.parent;
      const elementName =
        isJsxOpeningElement(element) || isJsxSelfClosingElement(element)
          ? getJsxName(element.tagName)
          : null;
      if (
        attribute === "size" ||
        ((attribute === "width" || attribute === "height") &&
          elementName !== null &&
          /(^|\.)svg$/.test(elementName))
      ) {
        ctx.report(node, iconSizeMessage);
      }
    },
    PropertyAssignment(node, ctx) {
      if (
        !isChecked(ctx) ||
        !isIdentifier(node.name) ||
        !lengthStyleKeys.has(node.name.text)
      ) {
        return;
      }
      const value = getNumericValue(node.initializer);
      if (
        value !== null &&
        value > MAX_HAIRLINE_PX &&
        isInStyleAttribute(node)
      ) {
        ctx.report(node, pxMessage);
      }
    },
  },
});
