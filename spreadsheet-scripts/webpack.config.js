const path = require('path');
const webpack = require('webpack');

const GASPlugin = require('gas-webpack-plugin');

module.exports = {
  context: __dirname,
  mode: 'development',
  devtool: false,
  entry: {
    slack: './src/slack.ts',
    pixela: './src/pixela.ts',
  },
  output: {
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      }
    ]
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new GASPlugin(),
  ]
}
