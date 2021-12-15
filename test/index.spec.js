// index.test.js
const pluginTester = require("babel-plugin-tester").default;
const myPlugin = require("../bundle/index");
const path = require("path");

function identifierReversePlugin() {
  return {
    name: "identifier reverse",
    visitor: {
      Identifier(idPath) {
        idPath.node.name = idPath.node.name.split("").reverse().join("");
      },
    },
  };
}

pluginTester({
  plugin: myPlugin,
  pluginName: "myPlugin",
  // 默认插件名
  title: "describe block title",
  // 传递给插件的 options，详见：https://babeljs.io/docs/en/plugins/#plugin-options
  pluginOptions: {
    optionA: true,
  },
  // 使用 jest 的 snapshot
  //   snapshot: true,
  // 读取的目录
  fixtures: path.join(__dirname, "__fixtures__"),
  tests: [
    {
      code: 'var hello = "hi";',
      output: 'var hello = "hi";',
    },
    {
      code: `
        function sayHi(person) {
          return 'Hello ' + person + '!'
        }
        console.log(sayHi('Jenny'))
      `,
      output: `
      function sayHi(person) {
        return "Hello " + person + "!";
      }

      console.log(sayHi("Jenny"));
    `,
    },
  ],
});
