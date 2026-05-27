import templateParser from '@angular-eslint/template-parser';
import templatePlugin from '@angular-eslint/eslint-plugin-template';

const a11yConfig = templatePlugin.configs.accessibility;

export default {
  files: ['src/**/*.html'],
  languageOptions: {
    parser: templateParser
  },
  plugins: {
    '@angular-eslint/template': templatePlugin
  },
  rules: {
    ...a11yConfig.rules
  }
};
