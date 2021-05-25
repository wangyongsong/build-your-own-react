/*
 * @Author: wangyongsong
 * @Date: 2021-05-24 13:21:38
 * @LastEditTime: 2021-05-24 19:41:00
 * @LastEditors: Please set LastEditors
 * @Description: Step Zero: Review
 * @FilePath: /build-your-own-react/React.js
 */

const element = {
    type: "h1",
    props: {
      title: "foo",
      children: "Hello",
    },
}
  ​
const container = document.getElementById("root")

// ReactDOM.render(element, container)
const node = document.createElement(element.type)
node["title"] = element.props.title
const text = document.createTextNode("")
text["nodeValue"] = element.props.children
node.appendChild(text)
container.appendChild(node);