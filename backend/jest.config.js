/** @type {import('jest').Config} */
const config = {
  // Indicates that the project uses ES Modules
  "transform": {
    "^.+\.js$": "babel-jest"
  },
  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  "testPathIgnorePatterns": [
    "/node_modules/"
  ],
  // The test environment that will be used for testing
  "testEnvironment": "node",
};

export default config;
