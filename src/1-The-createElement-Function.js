/*
 * @Author: wangyongsong
 * @Date: 2021-05-24 19:29:08
 * @LastEditTime: 2021-05-25 18:27:19
 * @LastEditors: Please set LastEditors
 * @Description: Step I: The `createElement` Function
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

  const Didact = {
    createElement,
  };
  
  // const element = Didact.createElement(
  //   "div",
  //   { id: "foo" },
  //   Didact.createElement("a", null, "bar"),
  //   Didact.createElement("b")
  // )
  
  /** @jsx Didact.createElement */
  const element = (
    <div id="foo">
      <a>bar</a>
      <b />
    </div>
  );

  const container = document.getElementById("root");
  //   ReactDOM.render(element, container)
})();
