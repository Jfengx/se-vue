import { ASTNode, NodeTypes } from '../ast';

function processExpression(node: ASTNode) {
  node.content = `_ctx.${node.content}`;
  return node;
}

export function transformExpression(node: ASTNode) {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content = processExpression(node.content);
  }
}
