const cssCode = `
body {
  color: red;
  background: white;
}

h1 {
  font-size: 24px;
  margin: 10px;
}
`;

function tokenizeCSS(cssString) {
  const ruleRegex = /([^{]+)\{([^}]+)\}/g;
  const tokens = [];
  let match = ruleRegex.exec(cssString);

  while (match !== null) {
    tokens.push({
      selector: match[1].trim(),
      declarations: match[2].trim(),
    });

    match = ruleRegex.exec(cssString);
  }

  return tokens;
}

function parseDeclarations(declarationsString) {
  return declarationsString
    .split(";")
    .filter(Boolean)
    .reduce((acc, decl) => {
      const [property, value] = decl.split(":").map((str) => str.trim());
      acc[property] = value;
      return acc;
    }, {});
}

function buildCSSOM(cssString) {
  const tokens = tokenizeCSS(cssString);
  return tokens.map((token) => ({
    selector: token.selector,
    declarations: parseDeclarations(token.declarations),
  }));
}

const cssOM = buildCSSOM(cssCode);
export default cssOM;
