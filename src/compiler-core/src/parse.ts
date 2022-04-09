import { NodeTypes } from './ast';

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createContext(content);

  const children = createRoot(parseChildren(context));

  return children;
}

function createContext(content: string) {
  return {
    source: content,
  };
}

function createRoot(children) {
  return {
    children,
  };
}

// 获取需要的东西
// 删除处理完的东西，继续推进
function parseChildren(context) {
  let node;
  const s = context.source;

  if (s.startsWith('{{')) {
    // interpolation
    node = parseInterpolation(context);
  } else if (s[0] === '<') {
    if (/[a-z]/i.test(s[1])) {
      // element
      node = parseElement(context);
    }
  } else {
    // text
    node = parseText(context);
  }

  const nodes: any = [];
  nodes.push(node);

  return nodes;
}

// 删除 -> 推进
function advanceBy(context, length: number) {
  context.source = context.source.slice(length);
}

// 处理 插值 {{ xxx }}
function parseInterpolation(context) {
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
function parseElement(context) {
  // 删头 <div> 并提取 tag
  const element = parseTag(context, TagType.Start);
  // 删尾 </div>
  parseTag(context, TagType.End);
  return element;
}

function parseTag(context, type) {
  // 解析 tag
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];
  // 删除解析完成的 <div></div>
  advanceBy(context, match[0].length + 1);

  if (type === TagType.End) return;

  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
}

function parseText(context) {
  const content = parseTextData(context, context.source.length);

  return {
    type: NodeTypes.TEXT,
    content,
  };
}

function parseTextData(context, length: number) {
  // 获取 content
  const content = context.source.slice(0, length);
  // 推进
  advanceBy(context, content.length);

  return content;
}
