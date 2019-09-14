module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    jquery: true
  },
  extends: ["eslint:recommended", "standard"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    // curly: ["error", "multi"],
    "no-new": 0,
    "brace-style": 0,
    "no-prototype-builtins": 0,
    "no-unused-vars": 0,
    "import/no-duplicates": 0,
    "no-unused-expressions": 0,
    "standard/no-callback-literal": 0,
    "space-before-function-paren": 0,
    semi: ["error", "always"],
    indent: ["warn", 2, { SwitchCase: 1 }],
    quotes: ["error", "double"],
    "no-undef": 0,
    "no-empty": 0,
    "no-redeclare": 0,
    "no-case-declarations": 0,
    "no-extend-native": 0,
    "no-prototype-builtins": 0,
    "no-useless-constructor": 0
  }
};
