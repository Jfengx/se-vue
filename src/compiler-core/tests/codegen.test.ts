import { baseParse } from '../src/parse';
import { generate } from '../src/codegen';
import { transform } from '../src/transform';
import { transformExpression } from '../src/transforms/transformExpression';

describe('codegen', () => {
  test('string', () => {
    const ast = baseParse('hi');
    transform(ast);
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });

  test('interpolation', () => {
    const ast = baseParse('{{ message }}');
    transform(ast, {
      nodeTransforms: <any>[transformExpression],
    });
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });
});
