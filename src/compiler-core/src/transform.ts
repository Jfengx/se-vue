import { ASTNode, NodeTypes } from './ast';
import { isArray } from '../../shared/index';
import { TO_DISPLAY_STRING } from './runtimeHelpers';

export type TransformContext = {
  root: ASTNode;
  helpers: Map<any, number>;
  helper: (s: any) => void;
} & TransformOptions;

type NodeTransforms<T, U> = (node: T, context: U) => void | ((node: T, context: U) => void)[];

type TransformOptions = {
  nodeTransforms?: NodeTransforms<ASTNode, TransformContext>;
};

function traverseNode(node: ASTNode, context: TransformContext) {
  // handle nodeTransforms
  const { nodeTransforms } = context;
  const exitFns: any = [];
  if (nodeTransforms) {
    if (isArray(nodeTransforms)) {
      for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        const onExit = transform(node, context);
        if (onExit) exitFns.push(onExit);
      }
    } else {
      nodeTransforms(node, context);
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

  let i = exitFns.length;
  while (i--) {
    exitFns[i]();
  }
}

function traveserChildren(node: ASTNode, context: TransformContext) {
  const { children } = node;
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    traverseNode(node, context);
  }
}

// TODO 现在只拿了第一个，处理不止一个的情况
// children['text', Element] 时不会处理 Element
function createCodeCodegen(node: ASTNode) {
  const child = node.children[0];
  if (child.type === NodeTypes.ELEMENT) {
    node.codegenNode = child.codegenNode;
  } else {
    node.codegenNode = child;
  }
}

function createTransformContext(root: ASTNode, options: TransformOptions) {
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

export function transform(root: ASTNode, options: TransformOptions = {}) {
  const context = createTransformContext(root, options);
  traverseNode(root, <TransformContext>context);
  createCodeCodegen(root);
  root.helpers = [...context.helpers.keys()];
}
