export const enum NodeTypes {
  INTERPOLATION,
  SIMPLE_EXPRESSION,
  ELEMENT,
  TEXT,
}

export type ASTNode = {
  type?: number;
  tag?: string;
  content?: any;
  children: ASTNode[];
};

export type RootNode = ASTNode & {
  codegenNode?: any;
};
