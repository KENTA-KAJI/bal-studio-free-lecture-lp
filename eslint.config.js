import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["script.js"],
    languageOptions: { globals: { window: "readonly", document: "readonly", IntersectionObserver: "readonly" } }
  }
];
