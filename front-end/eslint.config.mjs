import sonarjsConfig from './eslint.base.config.mjs';
import tsConfig from './eslint.typescript.config.mjs';

export default [
  sonarjsConfig,
  tsConfig,
  {
    ignores: [
      'dist/',
      'node_modules/',
      'e2e/',
      'coverage/',
      '**/*.spec.ts',
      '**/*.spec.ts.snap'
    ]
  }
];
