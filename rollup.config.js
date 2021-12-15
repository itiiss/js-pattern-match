export default {
  input: "./src/index.js",
  output: {
    file: "./bundle/index.js",
    format: "cjs", // use browser globals
    sourceMap: true,
  },
};
