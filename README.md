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

为了组织工作单元，我们需要一个数据结构：fiber tree。

每种元素都有一个fiber，每个fiber都是一个单元。

让我们看一个例子，假设我们想呈现这个element tree
```jsx
Didact.render(
  <div>
    <h1>
      <p />
      <a />
    </h1>
    <h2 />
  </div>,
  container
)
```
在`render`中，我们将创建一个fiber，并且将它设置为`nextUnitOfWork`，其余的工作将发生在`performUnitOfWork`函数，在那里我们将为fiber做三件事情：
1. 将元素加到DOM
2. 为元素的children创建fibers
3. 选择下一个工作单元


![fiber-tree-1.png](http://ww1.sinaimg.cn/large/006tISuoly1gr54oml0jcj30ls0hu0tp.jpg)

这样的数据结构的目标之一使查找下一个工作单元更容易，这就是每个fiber都会有连接到它的第一个child，它的下一个兄弟和父亲。

当我们在一个fiber完成工作，如果它有child，那么该fiber将是下一个工作单元。

在我们的示例中，当我们完成`div`fiber的工作时，下一个工作单元将是`h1`fiber。

如果fiber没有child，我们就会使用兄弟作为下一个工作单元。

例如，`p`fiber没有child所以在我们完成后，移到`a`fiber。 (`<p>` -> `<a>`)

![fiber-tree-2.png](http://ww1.sinaimg.cn/large/006tISuoly1gr54on05cej30la0h6gmr.jpg)

如果fiber没有child也没有兄弟，我们就去找“叔叔”：父亲的兄弟，比如例子中的`a`和`h2`。 (`<a>` -> `<h1>` -> `<h2>`)

而且，如果父亲没有兄弟,我们就继续往上走，直到找到一个有兄弟，或者一直找到根节点(root)，如果我们已经找到root，说明已经完成了所有的渲染工作。

现在开始写代码。

首先，我们从`render`函数中删除这段代码。
```js
 const dom =
   element.type === "TEXT_ELEMENT"
     ? document.createTextNode("")
     : document.createElement(element.type);

     
 const isProperty = (key) => key !== "children";

 Object.keys(element.props)
   .filter(isProperty)
   .forEach((name) => {
     dom[name] = element.props[name];
   });

 element.props.children.forEach((child) => {
   render(child);
 });

 if(container) container.appendChild(dom)
```

我们将创建DOM节点的函数保留在自己的函数中，稍后将使用它。

```js
function createDom(fiber) {
 const dom =
   element.type === "TEXT_ELEMENT"
     ? document.createTextNode("")
     : document.createElement(element.type);

     
 const isProperty = (key) => key !== "children";

 Object.keys(element.props)
   .filter(isProperty)
   .forEach((name) => {
     dom[name] = element.props[name];
   });
 return dom
}

function render(element, container) {
 // TODO set next unit of work
}
```

在`render`函数中，我们将`nextUnitOfWork`设置为fiber根节点(root)。

```js
function render(element, container) {
 nextUnitOfWork = {
   dom: container,
   props: {
     children: [element]
   }
 }
}
```

然后当浏览器准备好时，它将调用`workLoop`，我们将开始处理root。

```js
function performUnitOfWork(nextUnitOfWork) {
   // TODO add dom node
   // TODO create new fibers
   // TODO return next unit of work
}
```

首先我们创建一个节点，并将它添加到DOM。

我们在`fiber.dom`属性中追踪DOM。

```js
  function performUnitOfWork(fiber) {
    console.log(`fiber`, fiber);
    // TODO add dom node
    if (!fiber.dom) {
      fiber.dom = createDom(fiber);
    }
    if (fiber.parent) {
      fiber.parent.dom.appendChild(fiber.dom);
    }
    // TODO create new fibers
    // TODO return next unit of work
  }
```

我们为每个child创建一个fiber。

```js
  function performUnitOfWork(fiber) {
    // TODO add dom node
    if (!fiber.dom) {
      fiber.dom = createDom(fiber);
    }
    if (fiber.parent) {
      fiber.parent.dom.appendChild(fiber.dom);
    }
    // TODO create new fibers
    const elements = fiber.props.children;
    let index = 0;
    let preSibling = null;

    while (index < elements.length) {
      const element = elements[index]

      const newFiber = {
        type: element.type,
        props: element.props,
        parent: fiber,
        dom: null
      }

    }

    // TODO return next unit of work
  }
```

我们将它加入fiber tree根据它是否是第一个子节点，将它设置为子节点或者兄弟节点。

```js
   // TODO create new fibers
   //  ...
   if(index === 0) {
       fiber.child = newFiber
   } else {
       preSibling.sibling = newFiber
   }

   preSibling = newFiber
   index++
```

最后，我们去寻找下一个工作单元。我们首先尝试用child，然后是兄弟，然后叔叔以此类推。
```js
    // TODO return next unit of work
    if (fiber.child) {
      return fiber.child;
    }

    let nextFiber = fiber;
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling
      }
      nextFiber = nextFiber.parent
    }
```
这就是我们的`performUnitOfWork`
```js
  function performUnitOfWork(fiber) {
    // TODO add dom node
    if (!fiber.dom) {
      fiber.dom = createDom(fiber);
    }
    if (fiber.parent) {
      fiber.parent.dom.appendChild(fiber.dom);
    }
    // TODO create new fibers
    const elements = fiber.props.children;
    let index = 0;
    let preSibling = null;

    while (index < elements.length) {
      const element = elements[index];

      const newFiber = {
        type: element.type,
        props: element.props,
        parent: fiber,
        dom: null,
      };

      if (index === 0) {
        fiber.child = newFiber;
      } else {
        preSibling.sibling = newFiber;
      }

      preSibling = newFiber;
      index++;
    }

    // TODO return next unit of work
    if (fiber.child) {
      return fiber.child;
    }

    let nextFiber = fiber;
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling
      }
      nextFiber = nextFiber.parent
    }
  }
```


## Step V: Render and Commit Phases

```js
function performUnitOfWork(fiber) {

 // ...

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }

 //  ...

}
```

我们每次处理一个元素时，我们都会向DOM添加一个新的节点。**浏览器可能会在我们完成渲染整个树之前中断我们的工作**。在这种情况下，用户将看到一个不完整的UI。我们不希望那样。

因此，我们需要从这里删除改变DOM的部分。

```js
    if (fiber.parent) {
      fiber.parent.dom.appendChild(fiber.dom);
    }
 ```

相反，我们将追踪render tree的root，我们将它称之为正在进行的root或者`wipRoot`

```js
  let nextUnitOfWork = null;
  let wipRoot = null

  function render(element, container) {
    wipRoot = {
      dom: container,
      props: {
        children: [element],
      },
    };
    nextUnitOfWork = wipRoot
  }
```

一旦我们完成了所有工作（我们知道这一点是因为没有下一个工作单元）我们就将整个fiber tree提交给DOM。

```js
  function commitRoot() {
    // TODO add nodes to dom
  }

  function wookLoop(deadline) {

    // ...

    if(!nextUnitOfWork && wipRoot) {
      commitRoot()
    }

    // ...
  }
```
我们在`commitRoot`函数中执行，我们将递归所有节点添加到DOM中。


## Step VI: Reconciliation

到目前为止，我们只向DOM添加节点，但是更新和删除呢？

```js
  let wipRoot = null

  function commitRoot() {
    // TODO add nodes to dom
    commitWork(wipRoot.child)
    wipRoot = null
  }

  function commitWork(fiber) {
    if(!fiber) return
    const domParent = fiber.parent.dom
    domParent.appendChild(fiber.dom)
    commitWork(fiber.child)
    commitWork(fiber.sibling)
  }
```
这就是我们现在要做的，我们需要将渲染函数上接收到的元素与提交给DOM的最后一棵光纤树进行比较。

因此，在完成提交之后，我们需要保存对“提交给DOM的最后一个fiber tree”的引用。我们称它为`currentRoot`。

我们还在每一个fiber加了一个`alternate`属性，这个属性连接到旧fiber，即我们在前一个提交阶段提交给DOM的fiber。

```js
  let currentRoot = null

  function commitRoot() {
    // ...

    currentRoot = wipRoot

    // ...
  }

  function render(element, container) {
    wipRoot = {
      dom: container,
      props: {
        children: [element],
      },
      alternate: currentRoot
    };
    // ...
  }
```

现在，让我们从`performUnitOfWork`中提取创建新fiber的代码到新的`reconcileChildren`函数

```js
  function performUnitOfWork(fiber) {
    // ...

    const elements = fiber.props.children
    reconcileChildren(fiber, elements)

    // ...
  }

  function reconcileChildren(wipFiber, elements) {
    
  }
```

我们同时迭代旧fiber的子fiber(`wipFiber.alternate`)和希望协调的元素数组。

如果我们忽略同时遍历数组和链表所需的所有样板文件，就只剩下`while`中最重要的部分:`oldFiber`和`element`。元素是我们想要渲染到DOM的东西，而`oldFiber`是我们上次渲染的东西。

我们需要比较它们，看看是否有需要应用于DOM的任何更改。

```js
  function reconcileChildren(wipFiber, elements) {
    let index = 0 
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child

    while (index < elements.lengt || oldFiber != null) {
        const element = elements[index]

        // TODO compare oldFiber to element
        
    }
  }
```

要比较它们，我们使用type:

- 如果旧的fiber和新元素具有相同的类型，我们可以保留DOM节点，并使用新的属性更新它
- 如果类型不同，并且有一个新元素，这意味着我们需要创建一个新的DOM节点
- 如果类型不同，有一个旧的fiber，我们需要移除旧的节点

在这里React也使用了keys，这使得调解效果更好。例如，它检测子元素在元素数组中的位置何时改变。
```js
  function reconcileChildren(wipFiber, elements) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

    while (index < elements.lengt || oldFiber != null) {
      const element = elements[index];

      // TODO compare oldFiber to element
      const sameType = oldFiber && element && element.type;

      if (sameType) {
        // TODO update the node
      }
      if (element && !sameType) {
        // TODO add this node
      }
      if (oldFiber && !sameType) {
        // TODO delete the oldFiber's node
      }
    }
  }
```


当旧的fiber和元素具有相同的类型时，我们创建一个新的fiber，保留来自旧fiber的DOM节点和来自元素的属性。
我们还向fiber加了一个新属性:`effectTag`。我们将在稍后的提交阶段使用此属性。
```js
    if (sameType) {
      // TODO update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE"
      }
    }
```

然后，对于元素需要一个新的DOM节点的情况，我们使用`PLACEMENT`效果标签来标记新的fiber。
```js
    if (element && !sameType) {
      // TODO add this node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT"
      }
    }
```

对于需要删除节点的情况，我们没有新的fiber，所以我们将效果标签添加到旧的fiber上。
但是，当我们将fiber tree提交给DOM时，我们从正在进行的工作root执行，它没有旧的fiber。

```js
    if (oldFiber && !sameType) {
      // TODO delete the oldFiber's node
      oldFiber.effectTag = "DELETION"
      deletion.push(oldFiber)
    }
```

所以我们需要一个数组来跟踪我们想要删除的节点。

```js
  let deletions = null
  function render(element, container) {
    // ...
    deletions = []
    // ...
  }
```

然后，当我们向DOM提交更改时，我们还使用该数组中的fiber。
```js
  function commitRoot() {
    // ...
    deletions.forEach(commitWork)
    // ...
  }
```

现在，让我们更改`commitWork`函数来处理新的`effectTags`。
如果fiber有一个`PLACEMENT`效果标签，则执行与前面相同的操作，将DOM节点附加到来自父fiber的节点。

```js
  function commitWork(fiber) {
    // ...

    if(fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
      domParent.appendChild(fiber.dom)
    }

    // ...
  }
```

如果是`DELETION`，则相反，删除子元素。

```js
  if(fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
    domParent.appendChild(fiber.dom)
  } else if(fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom)
  }
```

如果它是一个`UPDATE`，我们需要用修改过的props更新现有的DOM节点。
我们将在这个`updateDom`函数中执行。

```js
  function commitWork(fiber) {
    if (!fiber) return;
    const domParent = fiber.parent.dom;
    if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
      domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
      updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    } else if (fiber.effectTag === "DELETION") {
      domParent.removeChild(fiber.dom);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
  }

  function updateDom(dom, prevProps, nextProps) {
    // TODO
  }
```

我们将旧fiber的props和新fiber的props进行对比，去掉没有的props，对新的或者改变的props进行设置。



<!-- ## Step VII: Function Components -->


<!-- ## Step VIII: Hooks -->



[requestIdleCallback]: https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback "requestIdleCallback"
[scheduler]: https://github.com/facebook/react/tree/master/packages/scheduler "scheduler"
