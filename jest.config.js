module.exports = {
  modulePaths: [
    '<rootDir>/src/',
    '<rootDir>/node_modules'
  ],
  transform: {
    '^.+\\.(js|ts)$': 'ts-jest'
  },
  transformIgnorePatterns: [
    'node_modules/@digitalbazaar/'
  ]
};
