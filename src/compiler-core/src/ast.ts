import { TransformContext } from './transform';
import { CREATE_ELEMENT_VNODE } from './runtimeHelpers';
export const enum NodeTypes {
  INTERPOLATION,
  SIMPLE_EXPRESSION,
  ELEMENT,
  TEXT,
  ROOT,
  COMPOUND_EXPRESSION,
}

export type ASTNode = {
  type?: number;
  tag?: string;
  content?: any;
  children: ASTNode[];
  codegenNode?: any;
  helpers?: any;
  props?: any;
};

export function createVNodeCall(
  context: TransformContext,
  tag: string,
  props,
  children: ASTNode[],
) {
  context.helper(CREATE_ELEMENT_VNODE);
  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children,
  };
}
