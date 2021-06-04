/*
 * @Author: wangyongsong
 * @Date: 2021-05-24 19:29:08
 * @LastEditTime: 2021-06-03 18:07:57
 * @LastEditors: Please set LastEditors
 * @Description: Step VI: Reconciliation
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
        : document.createElement(fiber.type);

    const isProperty = (key) => key !== "children";

    Object.keys(element.props)
      .filter(isProperty)
      .forEach((name) => {
        dom[name] = element.props[name];
      });
    return dom;
  }

  let nextUnitOfWork = null;
  let wipRoot = null;
  let currentRoot = null;
  let deletions = null;

  function commitRoot() {
    // TODO add nodes to dom
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
  }

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

  const isProperty = key => key !== "children"
  const isNew = (prev, next) => key => 


  function updateDom(dom, prevProps, nextProps) {
    // TODO
  }

  function render(element, container) {
    wipRoot = {
      dom: container,
      props: {
        children: [element],
      },
      alternate: currentRoot,
    };
    deletions = [];
    nextUnitOfWork = wipRoot;
  }

  function wookLoop(deadline) {
    let shouldYield = false;

    while (nextUnitOfWork && !shouldYield) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
      shouldYield = deadline.timeRemaining() < 1;
    }

    if (!nextUnitOfWork && wipRoot) {
      commitRoot();
    }

    requestIdleCallback(wookLoop);
  }

  requestIdleCallback(wookLoop);

  function performUnitOfWork(fiber) {
    // TODO add dom node
    if (!fiber.dom) {
      fiber.dom = createDom(fiber);
    }

    const elements = fiber.props.children;
    reconcileChildren(fiber, elements);

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
        return nextFiber.sibling;
      }
      nextFiber = nextFiber.parent;
    }
  }

  function reconcileChildren(wipFiber, elements) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

    while (index < elements.lengt || oldFiber != null) {
      const element = elements[index];

      // TODO compare oldFiber to element
      const sameType = oldFiber && element && element.type;

      if (sameType) {
        // TODO update the node
        newFiber = {
          type: oldFiber.type,
          props: element.props,
          dom: oldFiber.dom,
          parent: wipFiber,
          alternate: oldFiber,
          effectTag: "UPDATE",
        };
      }
      if (element && !sameType) {
        // TODO add this node
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          alternate: null,
          effectTag: "PLACEMENT",
        };
      }
      if (oldFiber && !sameType) {
        // TODO delete the oldFiber's node
        oldFiber.effectTag = "DELETION";
        deletion.push(oldFiber);
      }
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
