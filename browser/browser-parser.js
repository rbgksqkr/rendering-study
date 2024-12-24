const parseStyleSheets = () => {
  return Array.from(document.styleSheets).flatMap((styleSheet) => {
    return Array.from(styleSheet.cssRules)
      .filter((rule) => rule.constructor.name === "CSSStyleRule")
      .map((rule) => ({
        selector: rule.selectorText,
        declarations: Array.from(rule.style).reduce((acc, property) => {
          acc[property] = rule.style.getPropertyValue(property).trim();
          return acc;
        }, {}),
      }));
  });
};

const createRenderTree = (domNode, cssOM) => {
  // 노드가 시각적으로 표시되지 않는 경우 스킵
  if (
    domNode.nodeType !== Node.ELEMENT_NODE || // 요소 노드가 아닌 경우
    window.getComputedStyle(domNode).display === "none" // display: none인 경우
  ) {
    return null;
  }

  // 현재 노드의 스타일 계산
  const computedStyle = cssOM.reduce((acc, rule) => {
    if (domNode.matches(rule.selector)) {
      return { ...acc, ...rule.declarations }; // 스타일 병합
    }
    return acc;
  }, {});

  // 렌더 트리 노드 생성
  const renderNode = {
    tagName: domNode.tagName.toLowerCase(),
    styles: computedStyle,
    children: [],
  };

  // 자식 노드 처리 (재귀적으로 호출)
  Array.from(domNode.childNodes).forEach((child) => {
    const childRenderNode = createRenderTree(child, cssOM);
    if (childRenderNode) {
      renderNode.children.push(childRenderNode);
    }
  });

  return renderNode;
};

document.addEventListener("DOMContentLoaded", () => {
  const cssOM = parseStyleSheets();
  const renderTree = createRenderTree(document.documentElement, cssOM);
  console.log("브라우저단 렌더 트리:", renderTree);
});
