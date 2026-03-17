import js from "@eslint/js";

const eslintConfig = [
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "*.config.js",
      "*.config.mjs",
    ],
  },
];

export default eslintConfig;
