const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const webpack = require('webpack');
const path = require('path');

const config = {
  context: path.resolve(__dirname, './app/src'),
  entry: {
    //polyfill: 'babel-polyfill',
    app: './app.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader!sass-loader",
        })
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env']
            ]
          }
        }
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      }
    ]
  },
  devtool: 'inline-source-map',
  devServer: {
    port: 3000,   //Tell dev-server which port to run
    open: true,   // to open the local server in browser
    contentBase: path.resolve(__dirname, 'dist') //serve from 'dist' folder
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new CleanWebpackPlugin(['dist']), //cleans the dist folder
    new ExtractTextPlugin("css/styles.css"), //etracts css to dist/css/styles.css
    new HtmlWebpackPlugin({
      template: 'index.ejs'
    }),
    new webpack.HotModuleReplacementPlugin({
      multiStep: true
    }),
    new CopyWebpackPlugin([
      { from: 'assets' }
    ])
  ]
};

module.exports = config;
