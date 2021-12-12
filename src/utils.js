function getMatching(root) {
  return root.get("callee.arguments.0");
}

function getPatterns(root) {
  return root.get("arguments");
}

export { getPatterns, getMatching };
