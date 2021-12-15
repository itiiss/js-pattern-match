'use strict';

function MarkAST(path) {
  if (!/[./]match(\.c?js)?$/.test(path.node.source.value)) {
    return;
  }
  for (const declaration of path.node.specifiers) {
    const localName = declaration.local.name;
    const referencePaths = path.scope.getBinding(localName).referencePaths;

    for (const referencePath of referencePaths) {
      if (
        declaration.type === "ImportDefaultSpecifier" ||
        declaration.imported.name === "match"
      ) {
        referencePath.setData("pattern-match", "match");
      }
    }
  }
}

function getMatching(root) {
  return root.get("callee.arguments.0");
}

function getPatterns(root) {
  return root.get("arguments");
}

function resolveBody(babel, body) {
  if (body.type === "BlockStatement") {
    const returnExp = body.body;
    return babel.template(`
    (()=>{ 
        RETURN_EXP
    })()
    `)({ RETURN_EXP: returnExp }).expression;
  }
  return body;
}

function createIFBlock(babel, pattern, param, uid) {
  const leftName = param.get("left.name").node;
  const rightValue = param.get("right").node;
  const body = pattern.get("body");
  const returnExp = resolveBody(babel, body.node);
  body.scope.rename(leftName, uid.name);
  return babel.template(`
    if(UID === RIGHT_VALUE ){
      return RETURN_EXP
    }
  `)({
    UID: uid,
    RIGHT_VALUE: rightValue,
    RETURN_EXP: returnExp,
  });
}

function createReturnBlock(babel, pattern, param, uid) {
  const paramName = param.get("name").node;
  const body = pattern.get("body");
  const returnExp = resolveBody(babel, body.node);
  body.scope.rename(paramName, uid.name);
  return babel.template(`return RETURN_EXP`)({ RETURN_EXP: returnExp });
}

function transformPatterns(babel, patterns, uid) {
  return patterns.map((pattern) => {
    const param = pattern.get("params.0");
    const type = param.node.type;
    if (type === "AssignmentPattern") {
      return createIFBlock(babel, pattern, param, uid);
    } else if (type === "Identifier") {
      return createReturnBlock(babel, pattern, param, uid);
    }
  });
}

function transformMatch(babel, referencePath) {
  const root = referencePath.parentPath.parentPath;
  const uid = root.scope.generateUidIdentifier("uid");
  const rootValue = getMatching(root).node;
  const patterns = getPatterns(root) || [];
  const blocks = transformPatterns(babel, patterns, uid).filter((_) => !!_);

  const newRoot = babel.template(`
  (v=> {
    const UID = ROOT_VALUE
    BLOCKS
    throw new Error("No matching pattern");
  })()
  `)({
    UID: uid,
    ROOT_VALUE: rootValue,
    BLOCKS: blocks,
  });
  root.replaceWith(newRoot);
}

function ResolveMark(babel, path) {
  const callee = path.get("callee");
  if (callee.node.type === "Identifier") {
    const mark = callee.getData("pattern-match");
    if (mark === "match") {
      transformMatch(babel, callee);
    }
  }
}

var index = (babel) => {
  return {
    visitor: {
      ImportDeclaration(path) {
        MarkAST(path);
      },
      CallExpression(path, state) {
        ResolveMark(babel, path);
      },
    },
  };
};

module.exports = index;
