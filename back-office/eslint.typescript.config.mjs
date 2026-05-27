import tsParser from '@typescript-eslint/parser';

export default {
  files: ['src/**/*.ts'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2023,
      sourceType: 'module'
    }
  }
};
