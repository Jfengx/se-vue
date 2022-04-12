import { NodeTypes } from '../src/ast';
import { baseParse } from '../src/parse';
import { transform } from '../src/transform';

describe('transform', () => {
  test('happy path', () => {
    const ast = baseParse('<div>hi,{{ message }}</div>');

    const modify = (node) => {
      if (node.type === NodeTypes.TEXT) {
        node.content += 'se-vue';
      }
    };

    // const plugins = [modify];
    const plugins = modify;

    transform(ast, {
      nodeTransforms: plugins,
    });

    const nodeText = ast.children[0].children[0];
    expect(nodeText.content).toBe('hi,se-vue');
  });
});
