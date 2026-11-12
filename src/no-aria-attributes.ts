import { defineRule, isIdentifier } from "slop-police";

export const noAriaAttributes = defineRule({
  name: "no-aria-attributes",
  visit: {
    JsxAttribute(node, ctx) {
      if (isIdentifier(node.name) && node.name.text.startsWith("aria-")) {
        ctx.report(node, "Do not add aria attributes");
      }
    },
  },
});
