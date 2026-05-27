import sonarjs from 'eslint-plugin-sonarjs';

export default {
  plugins: {
    sonarjs
  },
  rules: {
    'sonarjs/cognitive-complexity': ['error', 15],
    'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/no-nested-conditional': 'warn'
  }
};
