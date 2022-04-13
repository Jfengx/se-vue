import { NodeTypes, ASTNode } from './ast';
import { helperMapName, TO_DISPLAY_STRING } from './runtimeHelpers';
import { RootNode } from './transform';

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

export function generate(ast: RootNode) {
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
function genFunctionPreamble(ast: RootNode, context: CodegenContext) {
  const { push } = context;
  const VueBinging = 'Vue';
  const aliasHelper = (source: string) => `${helperMapName[source]}: _${helperMapName[source]}`;
  if (ast.helpers.length > 0) {
    push(`const { ${ast.helpers.map(aliasHelper).join(' ,')} } = _${VueBinging}\n`);
  }
}

// 生成 string
function genText(node: ASTNode, context: CodegenContext) {
  const { push } = context;
  push(`'${node.content}'`);
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
  console.log(node);
  const { push } = context;
  push(`${node.content}`);
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
    default:
      break;
  }
}
