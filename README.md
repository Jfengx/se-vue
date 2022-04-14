# se-vue

> 📝 简易的 vue3 实现
> 📚 好好学习，天天向上

## core

### reactivity

- effect
  - [x] track
  - [x] trigger
  - [x] scheduler
  - [x] stop
  - [x] onStop

- ref
  - [x] effect
  - [x] isRef
  - [x] unRef
  - [x] proxyRefs

- reactive
  - [x] effect
  - [x] nested
  - [x] isReactive
  - [x] shallowReactive

- readonly
  - [x] nested
  - [x] isReadonly
  - [x] shallowReadonly

- computed
  - [x] lazy

- watch
  - [x] newValue & oldValue
  - [x] immediate

### runtime-core

- render
  - [x] custom renderer

- components
  - [x] events
  - [x] props
  - [x] emits
  - [x] slots
  - [x] fragment
  - [x] textNode
  - [x] getCurrentInstance
  - [x] provide & inject
  - [x] update
    - [x] props
    - [x] children
      - [x] text -> text
      - [x] text -> array
      - [x] array -> text
      - [x] array -> array !!!
    - [x] components
  - [x] nextTick

### compiler-core

- parse
  - [x] interpolation
  - [x] element
  - [x] text
  - [x] union ↑
- transform
  - [x] traverse
  - [x] custom options
- generate
  - [x] string
  - [x] interpolation
  - [x] element
  - [x] union ↑
    - [x] compound -> string + interpolation

### TODO

- compiler-core
  - [ ] 所有 children[0] 的地方扩展
