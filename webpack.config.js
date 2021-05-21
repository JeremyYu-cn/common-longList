const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const env = process.env.NODE_ENV;
const { VueLoaderPlugin, } = require('vue-loader')

let entry = path.resolve(__dirname, 'src', 'index.ts');
let filename = 'index.js';

if (env === 'nativeDev') {
  entry = path.resolve(__dirname, 'test', 'native','test.ts');
  filename = 'native.js';
} else if (env === 'vueDev') {
  entry = path.resolve(__dirname, 'test', 'vue','test.js');
  filename = 'indexVue.js';
}

module.exports = {
  mode: 'production',
  entry,
  output: {
    path: path.resolve(__dirname, 'build'),
    filename,
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /.*\.ts/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /.*\.vue/,
        use: 'vue-loader',
        exclude: /node_modules/,
      },
      {
        test: /.*\.css/,
        use: [ 'vue-style-loader', 'css-loader', ],
        exclude: /node_modules/,
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      title: 'test.html',
      filename: path.resolve(__dirname, 'build', 'index.html'),
      template: path.resolve(__dirname, 'test', 'public.html'),
    })
  ],

  devServer: {
    contentBase: path.resolve(__dirname, 'build'),
    port: 3000,
    compress: true,
  }
}
