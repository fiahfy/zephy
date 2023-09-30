module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['@fiahfy/react'],
  plugins: ['react-refresh'],
  rules: {
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
    'react/jsx-sort-props': 'error',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
