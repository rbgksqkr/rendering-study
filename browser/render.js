import getDOMTree from "./html-parser.js";
import cssOM from "./css-parser.js";

// Render Tree 생성
async function buildRenderTree(cssOM) {
  const domTree = await getDOMTree();

  function applyStyles(node, inheritedStyles = {}) {
    if (node.type === "element") {
      const cssRule = cssOM.find((rule) => rule.selector === node.tagName);
      const styles = cssRule
        ? { ...inheritedStyles, ...cssRule.declarations }
        : inheritedStyles;

      if (styles.display === "none") {
        return null;
      }

      return {
        tagName: node.tagName,
        styles,
        children: node.children
          .map((child) => applyStyles(child, styles)) // 자식 노드에 동일한 스타일 적용
          .filter(Boolean),
      };
    } else if (node.type === "text") {
      return { content: node.content };
    }
    return null;
  }

  const result = applyStyles(domTree);
  console.log(result);
}

// Render Tree 생성 및 출력
const renderTree = buildRenderTree(cssOM);
