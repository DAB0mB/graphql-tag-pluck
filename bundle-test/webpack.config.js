const path = require('path');

module.exports = {
  target: 'node',
  output: {
    filename: 'index.js',
  },
  resolve: {
    alias: {
      'graphql-tag-pluck': path.join(__dirname, '../build/graphql-tag-pluck.js'),
    },
    modules: ['node_modules', '../node_modules'],
  },
};
