# Build Your Own React
 
- Step I: The createElement Function
- Step II: The render Function
- Step III: Concurrent Mode
- Step IV: Fibers
- Step V: Render and Commit Phases
- Step VI: Reconciliation
- Step VII: Function Components
- Step VIII: Hooks

## Step Zero: Review

首先，让我们回顾一下基础的概念，如果你对`React`，`JSX`，和`DOM elements`的工作原理有一定的了解，那么你可以跳过这一步。

我们将使用`React`，只有三行代码。
1. 定义一个`React`
2. `DOM`中获取一个`node`
3. 渲染这个节点在`container`中

```js
const element = <h1 title="foo">Hello</h1>
const container = document.getElementById("root")
ReactDOM.render(element, container)
```

**让我们移除所有`React`具体的代码，用普通的(vanilla)`JavaScript`来替换它。**

第一行有个元素，定义在`JSX`，他甚至不是有效的`JavaScript`，所以为了替换成普通的`JS`，首先我们需要有效的`JS`替换它。

`JSX`通过构建工具(例如：`Babel`)转换为`JS`。这样的转换通常是很简单的：`const element = <h1 title="foo">Hello</h1>`标签内的代码替换为`craeteElement`，通过`tag name`、`props`、`children`作为参数。

```js
const element = React.createElement(
  "h1",
  { title: "foo" },
  "Hello"
)

const container = document.getElementById("root")
ReactDOM.render(element, container)
```

`React.createElement`根据其参数创建了一个对象，除了一些校验之外，这就是它的一切。因此，我们可以安全的用函数的输出替换函数的调用

```js
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  },
}
```

这就是一个元素，一个对象两个属性:`type`、`props`(它有更多属性，但我们只关心两个)。

- `type`: 是一个字符串,指定我们想要创建的`DOM`节点的类型，它是当你想要创建`HTML`元素时传递给`document.createElement`的`tagName`。它也可以是一个函数，但是我把他留到Step VII
- `props`: 是一个对象，它拥有来自`JSX`的属性的所有`key`和`value`，它还有一个特殊的属性(`children`)
  - `children`: 案例中的`children`是一个字符串，但它通常是更多元素的数组，这就是为什么元素也是树。

```js
ReactDOM.render(element, container)
```
我们需要替换的另一部分`React`代码是对`ReactDOM.render`的调用。
`render`是`React`改变`DOM`的地方，让我们自己来做更新。

```js
const node = document.createElement(element.type)
node["title"] = element.props.title
const text = document.createTextNode("")
text["nodeValue"] = element.props.children
node.appendChild(text)
container.appendChild(node)
```

**为了避免混淆，`element`代表`React element`和`node`代表`DOM elements`**

1. 我们创建一个节点`node`，使用`element.type` - "h1"
2. 我们将`element.props`的赋值在`node`，这里只赋值了`title`
3. 我们为`children`创建多个`node`，这里我们只有一个字符串作为child,因此我们创建一个`text node`
4. 使用`createTextNode`而不是设置`innerText`将允许我们用同样的方式处理所有`element`，注意我们设置`nodeValue`像`h1`的title一样，它几乎就像字符串有`props: {nodeValue: "hello"}`
5. 最终，我们将`textNode`加到`h1`，`h1`加到`container`

```js
const element = {
    type: "h1",
    props: {
      title: "foo",
      children: "Hello",
    },
}
  ​
const container = document.getElementById("root")

const node = document.createElement(element.type)
node["title"] = element.props.title

const text = document.createTextNode("")
text["nodeValue"] = element.props.children

node.appendChild(text)
container.appendChild(node)
```
现在我们有相同的app，但是我们没有使用React。

## Step I: The `createElement` Function

让我们重新开始另一个app，这一次我们将用自己的React版本替换React代码。

我们将开始写一个自己的`createElement`

让我们将`JSX`转化为`JS`，这样我们就可以看到`createElement`调用

![jsxTojs.png](http://ww1.sinaimg.cn/large/006tISuoly1gqtrx1ooynj32220juq7n.jpg)

```js
const element = React.createElement(
  "div",
  { id: "foo" },
  React.createElement("a", null, "bar"),
  React.createElement("b")
)
```

正如我们前面步骤所看到的，`element`是一个具备`type`和`props`的对象，我们函数唯一需要做的就是创建那个对象。

-------

```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children,
    },
  }
}
```

我们对`props`使用扩展运算符，对`children`使用`rest`参数语法，这样`children`将会一直是一个数组。

例如： 
- `createElement("div") ` returns
```js
{
  "type": "div",
  "props": { "children": [] }
}
```
- `createElement("div", null, a)` returns
```js
{
  "type": "div",
  "props": { "children": [a] }
}
```
- `createElement("div", null, a, b)` returns
```js
{
  "type": "div",
  "props": { "children": [a, b] }
}
```

------
```js
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((item) =>
        typeof item === "object" ? item : createTextElement(item)
      ),
    },
  };
}
```
`children`数组还可以包含字符串或数字等基本类型。因此，我们将把所有不是对象类型的`child`包装在自己的元素中，并且为它们创建一个特殊的type:`'TEXT_ELEMENT'`。

当没有`children`时`React`不会封装原始值或创建空数组，但我们这样做是因为它将我们的代码简化了，并且对于我们的库，我们更喜欢简单的代码而不是性能代码。

我们任然在使用`React`的`createElement`。

为了替换它，让我们给库取个名字。我们需要取一个名字听起来像`React`但又能暗示教学目的的名字。

我们可以叫它 **Didact**

```js
const Didact = {
  createElement,
}
​
const element = Didact.createElement(
  "div",
  { id: "foo" },
  Didact.createElement("a", null, "bar"),
  Didact.createElement("b")
)
```

但是我们仍然想在这里使用`JSX`，如何告诉`babel`使用`Didact`的`createElement`而不是`React`的

```jsx
/** @jsx Didact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)
```
如果我们有这样的注释，当`babel`转换`JSX`时，它将使用我们定义的函数

## Step II The `render` Function

```js
ReactDOM.render(element, container)
```
接下来我们要编写我们版本的`ReactDOM.render`函数。

就现在而言，我们只关心向`DOM`添加东西，之后我们将处理更新和删除。

```js
function render(element, container) {
  // TODO create dom nodes
}

Didact = {
  createElement,
  render
};

const element = Didact.createElement(
  "div",
  { id: "foo" },
  Didact.createElement("a", null, "bar"),
  Didact.createElement("b")
)

const container = document.getElementById("root");
Didact.render(element, container);
```

我们使用`element.type`创建`DOM`节点，然后将新的节点加入`container`。

我们递归对每个子节点执行相同的操作。
```js
function render(element, container) {
  const dom = document.createElement(element.type);

  element.props.children.forEach((child) => {
    render(child);
  });
  
  container.appendChild(dom);
}
```

我们也需要处理文本`element`，如果`element`的类型是`TEXT_ELEMENT`，我们将创建一个文本节点而不是常规节点。

我们需要做的最后一件事就是将`props`属性分配给节点。

```js
const isProperty = key => key !== "children"

Object.keys(element.props)
.filter(isProperty)
.forEach(name => {
  dom[name] = element.props[name]
});
```

就是这样，我们现在有一个可以渲染`JSX`和`DOM`的库。

## Step III Concurrent Mode

在这之前，在我们开始添加更多的代码之前，我们需要对代码进行重构。

有一个问题就是递归的调用。

```js
element.props.children.forEach(child =>
  render(child, dom)
)
```

一旦开始渲染，我们不会停止直到我们已经渲染出完整的元素树。如果元素树太大，它可能会阻塞主线程很久，如果浏览器需要做高优先级的事情，比如用户输入或保持动画流畅，它将不得不等到渲染完成。

所以我们将把工作分解成小单元，当我们完成每个单元后，如果有什么需要做的，我们会让浏览器中断渲染。

我们使用 [requestIdleCallback][] 循环，你可以把`requestIdleCallback`看做一个`setTimeout`，但是不是我们我们告诉它何时运行，浏览器会在主线程空闲的时运行回调。

```js
function wookLoop(deadline) {
  
  // ...

  requestIdleCallback(wookLoop)
}

requestIdleCallback(wookLoop)
```

`React`不再使用 `requestIdleCallback`，现在它使用[scheduler][]，但对于这个用例，概念上是相同的。

`requestIdleCallback`也给我们一个`deadline`参数，我们可以用它来检查还有多少时间，直到浏览器需要再次控制。

截止2019年11月，React并发模式还不稳定，循环的稳定版看起来更像这样：
```js
while (nextUnitOfWork) {    
  nextUnitOfWork = performUnitOfWork(   
    nextUnitOfWork  
  ) 
}
```

开始使用循环，我们需要设置第一个工作单元，然后编写一个`performUnitOfWork`函数，它不仅执行工作，而且返回下一个工作单元。

```js
let nextUnitOfWork = null

function wookLoop(deadline) {
  let shouldYield = false

  while(nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  requestIdleCallback(wookLoop)
}

requestIdleCallback(wookLoop)

function performUnitOfWork(nextUnitOfWork) {

}
```

## Step IV: Fibers






<!-- ## Step V: Render and Commit Phases -->


<!-- ## Step VI: Reconciliation -->


<!-- ## Step VII: Function Components -->


<!-- ## Step VIII: Hooks -->



[requestIdleCallback]: https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback "requestIdleCallback"
[scheduler]: https://github.com/facebook/react/tree/master/packages/scheduler "scheduler"
