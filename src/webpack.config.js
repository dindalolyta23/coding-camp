const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { GenerateSW } = require('workbox-webpack-plugin');
module.exports = {
  entry: {
    app: path.resolve(__dirname, "src/scripts/index.js"),
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.js$/,                // Menangani file .js
        exclude: /node_modules/,      // Tidak memproses file di dalam node_modules
        use: {
          loader: "babel-loader",     // Gunakan babel-loader untuk transpile JavaScript
          options: {
            presets: ["@babel/preset-env"],  // Gunakan preset-env untuk mendukung fitur ES6+
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src/index.html"),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/public/"),
          to: path.resolve(__dirname, "dist/"),
        },
      ],
    }),
    new GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
};
