export default {
    testEnvironment: 'node',
    transform: {},
    coveragePathIgnorePatterns: ['/node_modules/'],
    globals: {
      'ts-jest': {
        useESM: true,
      },
    },
  };
  