import { ASTNode } from './ast';
import { isArray } from '../../shared/index';

type NodeTransforms<T> = (node: T) => void | ((node: T) => void)[];

type TransformOptions = {
  nodeTransforms: NodeTransforms<ASTNode>;
};

type TransformContext = {
  root: ASTNode;
  nodeTransforms: NodeTransforms<ASTNode>;
};

function traverse(node: ASTNode, context: TransformContext) {
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

function traveserChildren(node: ASTNode, context: TransformContext) {
  const { children } = node;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      traverse(node, context);
    }
  }
}

function createTransformContext(root: ASTNode, options: TransformOptions) {
  return {
    root,
    nodeTransforms: options.nodeTransforms || [],
  };
}

export function transform(root: ASTNode, options) {
  const context = createTransformContext(root, options);
  traverse(root, context);
}
