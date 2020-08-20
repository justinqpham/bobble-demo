var path = require('path');
var fs = require('fs');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  entry: {
    main: './src/index.tsx',
    worklet: './src/worklet.ts'
  },
  // devtool: 'inline-source-map',
  mode: 'production',
  module: {
    rules: [{
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
    }, {
      test: /\.css$/,
      use: [ 'style-loader', 'css-loader' ]
    }, {
      test: /\.otf$/,
      use: 'url-loader'
    }, {
      test: /\.(png|jpe?g|gif)$/i,
      use: [
        {
          loader: 'file-loader',
        },
      ],
    }]
  },
  resolve: {
      extensions: ['.ts', '.js', '.tsx']
  },
  output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Custom template',
      chunks: [ "main" ],
      template: './src/index.html'
    })
  ],
  optimization: {
    usedExports: true,
    minimize: false
  },
};