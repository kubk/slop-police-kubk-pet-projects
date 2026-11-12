import {
  defineRule,
  isIdentifier,
  isNoSubstitutionTemplateLiteral,
  isStringLiteral,
  isTemplateExpression,
} from "slop-police";

export const noRedundantCn = defineRule({
  name: "no-redundant-cn",
  visit: {
    CallExpression(node, ctx) {
      const [argument] = node.arguments;
      if (
        isIdentifier(node.expression) &&
        node.expression.text === "cn" &&
        node.arguments.length === 1 &&
        (isStringLiteral(argument) ||
          isNoSubstitutionTemplateLiteral(argument) ||
          isTemplateExpression(argument))
      ) {
        ctx.report(node, "Use the class string directly instead of cn");
      }
    },
  },
});
