import { ASTNode, RootNode } from './ast';
import { isArray } from '../../shared/index';

type NodeTransforms<T> = (node: T) => void | ((node: T) => void)[];

type TransformOptions = {
  nodeTransforms?: NodeTransforms<ASTNode>;
};

type TransformContext = {
  root: ASTNode;
} & TransformOptions;

function traverse(node: RootNode, context: TransformContext) {
  // handle nodeTransforms
  const { nodeTransforms } = context;

  if (nodeTransforms) {
    if (isArray(nodeTransforms)) {
      for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        transform(node);
      }
    } else {
      nodeTransforms(node);
    }
  }

  traveserChildren(node, context);
}

function traveserChildren(node: RootNode, context: TransformContext) {
  const { children } = node;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      traverse(node, context);
    }
  }
}

// TODO 现在只拿了第一个
function createCodeCodegen(node: RootNode) {
  node.codegenNode = node.children[0];
}

function createTransformContext(root: RootNode, options: TransformOptions) {
  return {
    root,
    nodeTransforms: options.nodeTransforms || [],
  };
}

export function transform(root: RootNode, options: TransformOptions = {}) {
  const context = createTransformContext(root, options);
  traverse(root, <TransformContext>context);
  createCodeCodegen(root);
}
