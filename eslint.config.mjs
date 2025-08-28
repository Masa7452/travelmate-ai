// eslint.config.mjs
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import jsxA11y from "eslint-plugin-jsx-a11y";

// ★ typed ルールセットを TS/TSX にだけ適用するために files を付与してマッピング
const typedTSConfigs = tseslint.configs.recommendedTypeChecked.map((c) => ({
  ...c,
  files: ["**/*.{ts,tsx}"],
}));

/** @type {import('eslint').Linter.Config[]} */
export default [
  // 無視対象
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "eslint.config.mjs", // ← 追加: 自分自身は lint しない
      "next.config.ts", // ← 追加: config 類は解析不要
      "postcss.config.mjs", // ← 必要に応じて
      "createxyz-project/**", // ← 追加: createxyz-projectを除外
      "dummy/**", // ← 追加: dummyディレクトリを除外
      ".history/**", // ← 追加: VSCode履歴ディレクトリを除外
    ],
  },

  // JS ベース
  js.configs.recommended,

  // ★ TS typed ルール（await-thenable など）を TS/TSX にだけ適用
  ...typedTSConfigs,

  // TS/TSX の追加設定・プロジェクト参照・プロジェクト固有ルール
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: process.cwd(),
      },
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { React: true, JSX: true },
    },
    plugins: {
      import: importPlugin,
      "unused-imports": unusedImports,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      // TypeScript 厳格
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],

      // ループ方針: for/of/in は許容。forEach だけ禁止。
      "no-restricted-properties": [
        "error",
        {
          object: "Array",
          property: "forEach",
          message: "forEach は禁止です。map/filter/reduce を使用してください。",
        },
      ],

      // import 整理＆未使用検出
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // A11y（軽め）
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
    },
    settings: { "import/resolver": { typescript: true, node: true } },
  },

  // next-env.d.ts は Next の生成物なので該当ルールをOFF
  {
    files: ["next-env.d.ts"],
    rules: { "@typescript-eslint/triple-slash-reference": "off" },
  },

  // テストは any 許可 and other relaxed rules for tests
  {
    files: ["**/*.test.{ts,tsx}", "tests/**/*.{ts,tsx}", "**/*.e2e.ts"],
    rules: { 
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "import/order": "off",
    },
  },
];
