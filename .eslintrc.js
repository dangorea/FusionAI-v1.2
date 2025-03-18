module.exports = {
  extends: ['erb', 'plugin:storybook/recommended'],
  plugins: ['@typescript-eslint'],
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-import-module-exports': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'import/prefer-default-export': 'warn',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'react/require-default-props': 'off',
    'no-plusplus': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {prefer: 'type-imports', disallowTypeAnnotations: false},
    ],
    '@typescript-eslint/consistent-type-exports': 'error',
    'react/jsx-no-bind': 'off',
    'no-restricted-syntax': 'warn',
    'consistent-return': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-props-no-spreading': 'warn',
    'react/no-array-index-key': 'warn',
    'global-require': 'warn',
    'no-new': 'off',
    'promise/always-return': 'off',
    'react/no-unstable-nested-components': 'off'
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src/'],
      },
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
      typescript: {},
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/consistent-type-exports': 'off',
      },
    },
  ],
  ignorePatterns: ['.eslintrc.js'],
};
