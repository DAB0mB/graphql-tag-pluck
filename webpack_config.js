const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  devtool: 'sourcemap',
  entry: [
    path.resolve(__dirname, 'src')
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'graphql-tag-pluck.js',
    library: '',
    libraryTarget: 'commonjs2'
  },
  mode: 'none',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [
          'babel-loader'
        ]
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      entryOnly: false,
      raw: true
    })
  ],
  externals: [nodeExternals()],
  node: {
    __dirname: false,
    __filename: true,
  },
}
