import { ASTNode, createVNodeCall, NodeTypes } from '../ast';
import { TransformContext } from '../transform';

export function transformElement(node: ASTNode, context: TransformContext) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      // 中间处理层
      const { tag, props, children } = <any>node;
      // TODO 现在只拿了第一个，处理不止一个的情况
      let vnodeChildren = children[0];
      node.codegenNode = createVNodeCall(context, `"${tag}"`, props, vnodeChildren);
    };
  }
}
