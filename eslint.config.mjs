import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

const tsFilePatterns = ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"];

const typescriptConfigs = tseslint.configs.recommendedTypeChecked.map(
  (config) => {
    const languageOptions = config.languageOptions ?? {};
    const parserOptions = {
      ...(languageOptions.parserOptions ?? {}),
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    };

    return {
      ...config,
      files: tsFilePatterns,
      languageOptions: {
        ...languageOptions,
        parserOptions,
      },
    };
  },
);

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "pnpm-lock.yaml",
  ]),
  js.configs.recommended,
  ...typescriptConfigs,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
    settings: {
      next: {
        rootDir: ["./"],
      },
      react: {
        version: "detect",
      },
    },
  },
]);

export default eslintConfig;
