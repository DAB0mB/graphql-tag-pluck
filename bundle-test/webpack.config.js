const path = require('path');

module.exports = {
  target: 'node',
  output: {
    filename: 'index.js',
  },
  resolve: {
    alias: {
      'graphql-tag-pluck': path.join(__dirname, '../src/index.js'),
    },
    modules: ['node_modules', '../node_modules'],
  },
  externals: {
    'typescript': 'require("typescript")'
  }
};
