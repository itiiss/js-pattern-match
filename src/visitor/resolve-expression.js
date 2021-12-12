import transformMatch from "../transformer/match-transformer";

export default function ResolveMark(babel, path) {
  const callee = path.get("callee");
  if (callee.node.type === "Identifier") {
    const mark = callee.getData("pattern-match");
    if (mark === "match") {
      transformMatch(babel, callee);
    }
  }
}
