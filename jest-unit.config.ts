import {JestConfigWithTsJest, pathsToModuleNameMapper} from "ts-jest";

const {compilerOptions} = require('./tsconfig.json');

const jestUnitTestConfig: JestConfigWithTsJest = {
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js'],
  moduleDirectories: ['node_modules', 'src'],
  roots: ["<rootDir>/src/"],
  reporters: ['default'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  collectCoverage: true,
  coverageDirectory: 'coverage-unit',
  coverageReporters: ["text-summary", 'html', 'lcov'],
  collectCoverageFrom: [
    'src/**/**.service.{ts}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  coverageThreshold: {
    global: {
      functions: 40,
      branches: 80,
      statements: 30,
      lines: 30,
    },
  },
};

export default jestUnitTestConfig;