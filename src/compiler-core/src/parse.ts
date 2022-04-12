import { NodeTypes, ASTNode } from './ast';

type ParserContext = {
  source: string;
};

const enum TagType {
  Start,
  End,
}

// </div> => div
function startWithTagOpen(source: string, tag: string) {
  return (
    source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
  );
}

function isEnd(context: ParserContext, ancestors: ASTNode[]) {
  const s = context.source;

  if (s.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag!;
      if (startWithTagOpen(context.source, tag)) {
        return true;
      }
    }
  }

  return !s;
}

// 获取需要的东西
// 删除处理完的东西，继续推进
function parseChildren(context: ParserContext, ancestors: ASTNode[]) {
  const nodes: any = [];
  while (!isEnd(context, ancestors)) {
    let node;
    const s = context.source;

    if (s.startsWith('{{')) {
      // interpolation
      node = parseInterpolation(context);
    } else if (s[0] === '<') {
      if (/[a-z]/i.test(s[1])) {
        // element
        node = parseElement(context, ancestors);
      }
    } else {
      // text
      node = parseText(context);
    }
    nodes.push(node);
  }

  return nodes;
}

// 删除 -> 推进
function advanceBy(context: ParserContext, length: number) {
  context.source = context.source.slice(length);
}

// 处理 插值 {{ xxx }}
function parseInterpolation(context: ParserContext) {
  const openDelimiter = '{{';
  const closeDelimiter = '}}';

  const closeIndex = context.source.indexOf(closeDelimiter, closeDelimiter.length);
  // 删除 {{
  advanceBy(context, openDelimiter.length);
  // 获取 xxx 内容长度
  const rawContentLength = closeIndex - openDelimiter.length;
  // 获取 xxx 并删除 xxx
  const rawContent = parseTextData(context, rawContentLength);
  const content = rawContent.trim();
  // 继续推进删除 去除 }}
  advanceBy(context, closeDelimiter.length);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    },
  };
}

// 处理 element <div></div>
function parseElement(context: ParserContext, ancestors: ASTNode[]) {
  // 删头 <div> 并提取 tag
  const element: any = parseTag(context, TagType.Start);
  // 获取中间内容
  ancestors.push(element);
  element.children = parseChildren(context, ancestors);
  ancestors.pop();
  if (startWithTagOpen(context.source, element.tag)) {
    // 删尾 </div>
    parseTag(context, TagType.End);
  } else {
    throw new Error(`缺少结束标签：${element.tag}`);
  }

  return element;
}

function parseTag(context: ParserContext, type: number) {
  // 解析 tag
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];
  // 删除解析完成的 <div></div>
  advanceBy(context, match[0].length);
  advanceBy(context, 1);

  if (type === TagType.End) return;

  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
}

function parseText(context: ParserContext) {
  const endTokens = ['<', '{{'];

  let endIndex = context.source.length;

  for (let i = 0; i <= endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i]);
    // 取小的
    if (endIndex > index && index !== -1) {
      endIndex = index;
    }
  }

  const content = parseTextData(context, endIndex);

  return {
    type: NodeTypes.TEXT,
    content,
  };
}

function parseTextData(context: ParserContext, length: number) {
  // 获取 content
  const content = context.source.slice(0, length);
  // 推进
  advanceBy(context, content.length);

  return content;
}

function createContext(content: string): ParserContext {
  return {
    source: content,
  };
}

function createRoot(children: ASTNode[]) {
  return {
    children,
  };
}

export function baseParse(content: string) {
  const context = createContext(content);
  const children = createRoot(parseChildren(context, []));
  return children;
}
