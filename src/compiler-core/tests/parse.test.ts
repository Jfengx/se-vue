import { NodeTypes } from '../src/ast';
import { baseParse } from '../src/parse';

describe('Parse', () => {
  describe('interpolation', () => {
    test('simple interpolation', () => {
      const ast = baseParse('{{ message }}');
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'message',
        },
      });
    });
  });

  describe('element', () => {
    test('simple element div', () => {
      const ast = baseParse('<div></div>');
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: 'div',
        children: [],
      });
    });
  });

  describe('text', () => {
    test('simple text', () => {
      const text = 'some text';
      const ast = baseParse(text);
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: text,
      });
    });
  });

  describe('interpolation + element + text', () => {
    // happy path
    test('base hello world', () => {
      const ast = baseParse('<div>hi,{{ message }}</div>');
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: 'div',
        children: [
          {
            type: NodeTypes.TEXT,
            content: 'hi,',
          },
          {
            type: NodeTypes.INTERPOLATION,
            content: {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: 'message',
            },
          },
        ],
      });
    });

    // edge case
    test('Nested Element', () => {
      const ast = baseParse('<div><p>hi</p>{{ message }}</div>');
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: 'div',
        children: [
          {
            type: NodeTypes.ELEMENT,
            tag: 'p',
            children: [
              {
                type: NodeTypes.TEXT,
                content: 'hi',
              },
            ],
          },
          {
            type: NodeTypes.INTERPOLATION,
            content: {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: 'message',
            },
          },
        ],
      });
    });

    test('should throw error when lack and tag', () => {
      expect(() => {
        baseParse('<div><span></div>');
      }).toThrow('缺少结束标签：span');
    });
  });
});
