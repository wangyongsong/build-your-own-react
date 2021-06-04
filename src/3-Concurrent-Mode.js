/*
 * @Author: wangyongsong
 * @Date: 2021-05-24 19:29:08
 * @LastEditTime: 2021-06-03 15:45:53
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
    return dom
  }

  let nextUnitOfWork = null

  function render(element, container) {
    nextUnitOfWork = {
      dom: container,
      props: {
        children: [element]
      }
    }
  }


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
      // TODO
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
