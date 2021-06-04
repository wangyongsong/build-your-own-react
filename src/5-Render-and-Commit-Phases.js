/*
 * @Author: wangyongsong
 * @Date: 2021-05-24 19:29:08
 * @LastEditTime: 2021-06-03 18:07:57
 * @LastEditors: Please set LastEditors
 * @Description: Step III: Concurrent Mode
 * @FilePath: /build-your-own-react/React.js
 */
(() => {
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
    return dom;
  }

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

  function wookLoop(deadline) {
    let shouldYield = false;

    while (nextUnitOfWork && !shouldYield) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
      shouldYield = deadline.timeRemaining() < 1;
    }

    requestIdleCallback(wookLoop);
  }

  requestIdleCallback(wookLoop);

  function performUnitOfWork(fiber) {
    // TODO add dom node
    if (!fiber.dom) {
      fiber.dom = createDom(fiber);
    }
    
    // if (fiber.parent) {
    //   fiber.parent.dom.appendChild(fiber.dom);
    // }

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

  const Didact = {
    createElement,
    render,
  };

  /** @jsx Didact.createElement */
  const element = (
    <div id="foo">
      <a href="b">bar</a>
      <b />
    </div>
  );

  const container = document.getElementById("root");
  Didact.render(element, container);
})();
