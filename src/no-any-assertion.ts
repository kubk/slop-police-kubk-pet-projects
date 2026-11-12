import {
  defineRule,
  SyntaxKind,
  type AsExpression,
  type RuleContext,
  type TypeAssertion,
} from "slop-police";

function checkAssertion(node: AsExpression | TypeAssertion, ctx: RuleContext) {
  if (node.type.kind === SyntaxKind.AnyKeyword) {
    ctx.report(
      node,
      "Use a concrete type or narrow the value instead of asserting it to any",
    );
  }
}

export const noAnyAssertion = defineRule({
  name: "no-any-assertion",
  visit: {
    AsExpression: checkAssertion,
    TypeAssertionExpression: checkAssertion,
  },
});
