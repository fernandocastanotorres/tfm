import sonarjsConfig from './eslint.base.config.mjs';
import tsConfig from './eslint.typescript.config.mjs';
import templateConfig from './eslint.template.config.mjs';

export default [
  sonarjsConfig,
  tsConfig,
  templateConfig,
  {
    ignores: [
      'dist/',
      'node_modules/',
      'coverage/',
      '**/*.spec.ts',
      '**/*.spec.ts.snap'
    ]
  }
];
