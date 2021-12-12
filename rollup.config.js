export default {
  input: "./src/index.js",
  output: {
    file: "./dist/index.js",
    format: "cjs", // use browser globals
    sourceMap: true,
  },
};
