const path = require('path');
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
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
  ]
}
