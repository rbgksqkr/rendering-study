const selfClosingTags = new Set(["meta", "img", "input", "link", "br", "hr"]);

const getHTML = async () => {
  return await fetch("/");
};

// 1. 바이트 코드를 HTML 문자열로 변환
const decodeHTML = async () => {
  const response = await getHTML();
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("charset=UTF-8")) {
    const buffer = await response.arrayBuffer(); // 바이트 데이터로 읽기
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(buffer); // 문자열로 변환

    // return await response.text(); // 위의 3줄을 한줄로 사용 가능
  } else {
    console.error("Unsupported Content-Type or charset missing");
    return null;
  }
};

// 2. HTML 문자열을 토큰으로 분해
const tokenizeHTML = (htmlString) => {
  const tagRegex =
    /<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<\/?([a-zA-Z0-9\-]+)([^>]*)>|([^<]+)/g;
  const tokens = [];
  let match = tagRegex.exec(htmlString);

  while (match !== null) {
    if (match[0].startsWith("<!--")) {
      // Comment 토큰
      tokens.push({
        type: "comment",
        content: match[0].slice(4, -3).trim(), // 주석 내용만 추출
      });
    } else if (match[0].startsWith("<!DOCTYPE")) {
      // Doctype 토큰
      tokens.push({
        type: "doctype",
        content: match[0],
      });
    } else if (match[1]) {
      // 일반 태그 토큰
      tokens.push({
        type: match[0].startsWith("</") ? "closing-tag" : "opening-tag",
        tagName: match[1],
        attributes: match[2].trim(),
      });
    } else if (match[3].trim()) {
      // 텍스트 토큰
      tokens.push({
        type: "text",
        content: match[3].trim(),
      });
    }

    match = tagRegex.exec(htmlString);
  }

  return tokens;
};

// 노드를 생성할 때 속성 문자열을 객체로 변환
const parseAttributes = (attributesString) => {
  if (!attributesString) return {};
  return attributesString
    .split(/\s+/)
    .map((attr) => attr.split("="))
    .reduce((acc, [key, value]) => {
      acc[key] = value ? value.replace(/['"]/g, "") : ""; // 따옴표 제거
      return acc;
    }, {});
};

// 3. 각 토큰을 기반으로 노드 생성
const createNode = (token) => {
  if (token.type === "opening-tag") {
    return {
      type: "element",
      tagName: token.tagName,
      attributes: parseAttributes(token.attributes),
      children: [],
    };
  } else if (token.type === "text") {
    return {
      type: "text",
      content: token.content,
    };
  } else if (token.type === "comment") {
    return {
      type: "comment",
      content: token.content,
    };
  }

  return null;
};

// 4. DOM 트리 생성
const buildDOMTree = (tokens) => {
  const root = { type: "root", children: [] };
  const stack = [root];

  tokens.forEach((token) => {
    if (token.type === "opening-tag") {
      const node = createNode(token);
      if (node) {
        stack[stack.length - 1].children.push(node); // 부모에 추가

        if (!selfClosingTags.has(token.tagName)) {
          stack.push(node); // Self-closing 태그가 아니면 스택에 추가
        }
      }
    } else if (token.type === "closing-tag") {
      stack.pop();
    } else if (token.type === "text" || token.type === "comment") {
      const node = createNode(token);
      if (node) {
        stack[stack.length - 1].children.push(node); // 부모에 텍스트 추가
      }
    }
  });

  return root.children; // 최종 DOM 트리 반환
};

// 5. DOM 트리 출력
const printDOMTree = (nodes, depth = 0) => {
  nodes.forEach((node) => {
    if (node.type === "element") {
      console.log(`${"  ".repeat(depth)}<${node.tagName}>`);
      printDOMTree(node.children, depth + 1); // 자식 노드 출력
      console.log(`${"  ".repeat(depth)}</${node.tagName}>`);
    } else if (node.type === "text") {
      console.log(`${"  ".repeat(depth)}${node.content}`);
    } else if (node.type === "comment") {
      console.log(`${"  ".repeat(depth)}<-- ${node.content} -->`);
    }
  });
};

decodeHTML().then((htmlString) => {
  if (htmlString) {
    const tokens = tokenizeHTML(htmlString);
    const domTree = buildDOMTree(tokens);
    printDOMTree(domTree);
  }
});
