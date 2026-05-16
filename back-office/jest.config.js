module.exports = {
  displayName: 'back-office',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageReporters: ['lcov'],
  coverageDirectory: '../../coverage/back-office'
};
