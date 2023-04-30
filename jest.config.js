export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // modulePathIgnorePatterns: ['<rootDir>/dist/'],
  verbose: true,
  // globals: {
  //   'ts-jest': { tsconfig: './tsconfig.json', useESM: true },
  // },
  transform: {
    // '^.+\\.ts$': 'ts-jest',
    transform_regex: ['ts-jest', { tsconfig: './tsconfig.json', useESM: true }],
  },
  transformIgnorePatterns: ['node_modules/(?!ansiStyles/.*)', 'node_modules/(?!lowdb)'],
  setupFilesAfterEnv: ['jest-extended/all'],
};
