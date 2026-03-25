import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const lintTargets = [
  'nuxt.config.ts',
  'server/**/*.{js,ts}',
  'middleware/**/*.ts',
  'prisma/**/*.ts',
  'tests/**/*.ts',
];

const nuxtGlobals = {
  $fetch: 'readonly',
  createError: 'readonly',
  defineEventHandler: 'readonly',
  defineNuxtConfig: 'readonly',
  defineNuxtRouteMiddleware: 'readonly',
  deleteCookie: 'readonly',
  getCookie: 'readonly',
  getQuery: 'readonly',
  getRequestHeader: 'readonly',
  getRequestURL: 'readonly',
  getRouterParam: 'readonly',
  navigateTo: 'readonly',
  readBody: 'readonly',
  readRawBody: 'readonly',
  sendRedirect: 'readonly',
  setCookie: 'readonly',
  setHeader: 'readonly',
  useHead: 'readonly',
  useRequestFetch: 'readonly',
  useRequestURL: 'readonly',
  useRoute: 'readonly',
  useRuntimeConfig: 'readonly',
  useSeoMeta: 'readonly',
};

export default tseslint.config(
  {
    ignores: [
      '.nuxt/**',
      '.output/**',
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'public/**',
      'assets/**',
      'pages/**',
      'components/**',
      'layouts/**',
      'app.vue',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: lintTargets,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...nuxtGlobals,
      },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  }
);
