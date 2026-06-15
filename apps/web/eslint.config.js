import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

/**
 * Flat ESLint config — JS/TS/React 기본.
 * FSD 하향-임포트/슬라이스 경계 검사는 `lint:fsd` (steiger)가 담당
 * (steiger.config.js — FSD-native 린터, ADR-0001).
 */
export default tseslint.config(
  {
    ignores: ['dist', 'node_modules'],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['vite.config.ts', 'eslint.config.js', 'steiger.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // app 레이어 라우터 엔트리: 라우트 구성(routes) + 셸 컴포넌트를 함께 export.
    // react-refresh fast-refresh 경고는 라우터/구성 파일엔 부적용 (Vite 템플릿 관례).
    files: ['src/app/app.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
);
