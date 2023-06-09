module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['@fiahfy/next'],
  rules: {
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
    'react/jsx-sort-props': 'error',
    '@next/next/no-html-link-for-pages': ['error', 'renderer/pages'],
  },
}
