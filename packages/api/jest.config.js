export default {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.js?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  roots: ['.'],
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/**/*.test.{js,jsx}', '!src/**/index.{js,jsx}', '!src/**/node_modules/**', '!src/setupTests.js'],
  coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/dist/', '<rootDir>/build/'],
};
