const path = require('path');

module.exports = {
  entry: './src/ui/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ui.js',
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
};
