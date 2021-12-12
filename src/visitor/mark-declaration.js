export default function MarkAST(path) {
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
