import { NodeTypes, ASTNode } from './ast';
import { helperMapName, TO_DISPLAY_STRING, CREATE_ELEMENT_VNODE } from './runtimeHelpers';
import { isString } from '../../shared/index';

type CodegenContext = {
  code: string;
  push: (s: string) => void;
  helper: (s: any) => string;
};

function createCodegenContext(): CodegenContext {
  const context = {
    code: '',
    push: (source: string) => {
      context.code += source;
    },
    helper(key) {
      return `_${helperMapName[key]}`;
    },
  };

  return context;
}

export function generate(ast: ASTNode) {
  const context = createCodegenContext();
  const { push } = context;

  genFunctionPreamble(ast, context);

  push('return ');

  const functionName = 'render';
  const args = ['_ctx', '_cache'];
  const signature = args.join(' ,');
  push(`function ${functionName}(${signature}){`);

  push('return ');
  genNode(ast.codegenNode, context);
  push('}');

  return {
    code: context.code,
  };
}

// 外部 helpers 引入
// const { toDisplayString: _toDisplayString } = _Vue
function genFunctionPreamble(ast: ASTNode, context: CodegenContext) {
  const { push } = context;
  const VueBinging = 'Vue';
  const aliasHelper = (source: string) => `${helperMapName[source]}: _${helperMapName[source]}`;
  if (ast.helpers && ast.helpers.length > 0) {
    push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = _${VueBinging}\n`);
  }
}

// 生成 string
function genText(node: ASTNode, context: CodegenContext) {
  const { push } = context;
  push(`"${node.content}"`);
}

// 生成 interpolation
function genInterpolation(node: ASTNode, context: CodegenContext) {
  const { push, helper } = context;
  push(helper(TO_DISPLAY_STRING));
  push('(');
  genNode(node.content, context);
  push(')');
}

// 生成 interpolation simple_expression
function genExpression(node: ASTNode, context: CodegenContext) {
  const { push } = context;
  push(`${node.content}`);
}

// 生成 element
function genElement(node: ASTNode, context: CodegenContext) {
  const { push, helper } = context;
  const { tag, children, props } = node;

  push(helper(CREATE_ELEMENT_VNODE));
  push(`(`);
  genNodeList(genNullable([tag, props, children]), context);
  push(')');
}

// 处理 text + interpolation
function genCompound(node: ASTNode, context: CodegenContext) {
  const { children } = node;
  const { push } = context;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isString(child)) {
      push(<any>child);
    } else {
      genNode(child, context);
    }
  }
}

// 生成 返回值
function genNode(node: ASTNode, context: CodegenContext) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    case NodeTypes.ELEMENT:
      genElement(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompound(node, context);
      break;
    default:
      break;
  }
}

function genNodeList(nodes: ASTNode[], context: CodegenContext) {
  const { push } = context;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isString(node)) {
      push(<any>node);
    } else {
      genNode(node, context);
    }

    if (i < nodes.length - 1) {
      push(', ');
    }
  }
}

function genNullable(arr) {
  return arr.map((v) => v || 'null');
}
