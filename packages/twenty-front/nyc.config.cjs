const globalCoverage = {
  branches: 45,
  statements: 60,
  lines: 60,
  functions: 60,
  exclude: ['src/generated/**/*'],
};

const modulesCoverage = {
  branches: 25,
  statements: 49,
  lines: 50,
  functions: 38,
  include: ['src/modules/**/*'],
  exclude: ['src/**/*.ts'],
};

const pagesCoverage = {
  branches: 35,
  statements: 60,
  lines: 60,
  functions: 45,
  exclude: ['src/generated/**/*', 'src/modules/**/*', 'src/**/*.ts'],
};

const performanceCoverage = {
  branches: 35,
  statements: 60,
  lines: 60,
  functions: 45,
  exclude: ['src/generated/**/*', 'src/modules/**/*', 'src/**/*.ts'],
};

const storybookStoriesFolders = process.env.STORYBOOK_SCOPE;

module.exports =
  storybookStoriesFolders === 'pages'
    ? pagesCoverage
    : storybookStoriesFolders === 'modules'
      ? modulesCoverage
      : storybookStoriesFolders === 'performance'
        ? performanceCoverage
      : globalCoverage;
