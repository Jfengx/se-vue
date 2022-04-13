import { RootNode } from './ast';

function createCodegenContext() {
  const context = {
    code: '',
    push: (source: string) => {
      context.code += source;
    },
  };

  return context;
}

export function generate(ast: RootNode) {
  const context = createCodegenContext();
  const { push } = context;

  push('return ');

  const functionName = 'render';
  const args = ['_ctx', '_cache'];
  const signature = args.join(' ,');
  push(`function ${functionName}(${signature}){`);

  push('return ');
  genNode(ast, context);
  push('}');

  return {
    code: context.code,
  };
}

function genNode(ast: RootNode, context) {
  const { push } = context;
  const node = ast.codegenNode;
  push(`'${node.content}'`);
}
