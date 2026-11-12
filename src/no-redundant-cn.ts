import {
  defineRule,
  isIdentifier,
  isNoSubstitutionTemplateLiteral,
  isParenthesizedExpression,
  isStringLiteral,
  isTemplateExpression,
} from "slop-police";

export const noRedundantCn = defineRule({
  name: "no-redundant-cn",
  visit: {
    CallExpression(node, ctx) {
      if (
        !isIdentifier(node.expression) ||
        node.expression.text !== "cn" ||
        node.arguments.length !== 1
      ) {
        return;
      }
      let argument = node.arguments[0];
      while (isParenthesizedExpression(argument)) {
        argument = argument.expression;
      }
      if (
        isStringLiteral(argument) ||
        isNoSubstitutionTemplateLiteral(argument) ||
        isTemplateExpression(argument)
      ) {
        ctx.report(node, "Use the class string directly instead of cn");
      }
    },
  },
});
