/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './src',
  moduleNameMapper: {
    '^@gxpl/components/elements$': require.resolve('@gxpl/components/elements')
  }
};