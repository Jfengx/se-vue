export const enum NodeTypes {
  INTERPOLATION,
  SIMPLE_EXPRESSION,
  ELEMENT,
  TEXT,
  ROOT,
}

export type ASTNode = {
  type?: number;
  tag?: string;
  content?: any;
  children: ASTNode[];
};
