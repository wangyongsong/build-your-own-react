/*
 * @Author: wangyongsong
 * @Date: 2021-05-24 19:29:08
 * @LastEditTime: 2021-05-26 09:52:00
 * @LastEditors: Please set LastEditors
 * @Description: Step II: The `render` Function
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

  function render(element, container) {
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

    if (container) container.appendChild(dom);
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
