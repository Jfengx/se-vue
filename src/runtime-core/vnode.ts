export type VNODE = {
  type: ComponentType;
  props: Record<string, any>;
  children: null | string | VNODE[];
};

export type Component = {
  render(): VNODE;
  setup?: () => unknown;
};

export type ComponentType = Component | string;

export function createVNode(type: ComponentType, props?, children?): VNODE {
  const vnode = {
    type,
    props,
    children,
  };

  return vnode;
}
