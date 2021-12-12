import markImportDeclaration from "./visitor/mark-declaration";
import resolveCallExpression from "./visitor/resolve-expression";

export default (babel) => {
  return {
    visitor: {
      ImportDeclaration(path, state) {
        markImportDeclaration(babel, path, state);
      },
      CallExpression(path, state) {
        resolveCallExpression(babel, path, state);
      },
    },
  };
};
