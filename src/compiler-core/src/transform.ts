import { ASTNode, NodeTypes } from './ast';
import { isArray } from '../../shared/index';
import { TO_DISPLAY_STRING } from './runtimeHelpers';

export type RootNode = ASTNode & {
  codegenNode?: any;
  helpers?: any;
};

type NodeTransforms<T> = (node: T) => void | ((node: T) => void)[];

type TransformOptions = {
  nodeTransforms?: NodeTransforms<ASTNode>;
};

type TransformContext = {
  root: ASTNode;
  helpers: Map<any, number>;
  helper: (s: any) => void;
} & TransformOptions;

function traverseNode(node: RootNode, context: TransformContext) {
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

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traveserChildren(node, context);
      break;
    default:
      break;
  }
}

function traveserChildren(node: RootNode, context: TransformContext) {
  const { children } = node;
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    traverseNode(node, context);
  }
}

// TODO 现在只拿了第一个
function createCodeCodegen(node: RootNode) {
  node.codegenNode = node.children[0];
}

function createTransformContext(root: RootNode, options: TransformOptions) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || undefined,
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1);
    },
  };
  return context;
}

export function transform(root: RootNode, options: TransformOptions = {}) {
  const context = createTransformContext(root, options);
  traverseNode(root, <TransformContext>context);
  createCodeCodegen(root);
  root.helpers = [...context.helpers.keys()];
}
