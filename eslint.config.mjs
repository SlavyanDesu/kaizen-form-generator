// @ts-check

import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig({
  ignores: ["dist/**", "node_modules/**"],
  files: ["**/*.{js,ts}"],
  extends: [
    js.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    eslintPluginPrettierRecommended,
  ],
});
