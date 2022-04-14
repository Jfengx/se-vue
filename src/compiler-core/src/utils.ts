import { NodeTypes, ASTNode } from './ast';

export const isText = (node: ASTNode) =>
  node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION;
