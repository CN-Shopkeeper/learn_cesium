const cesiumSource = "node_modules/cesium/Build/Cesium";
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const HtmlPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
module.exports = {
  mode: "development",
  plugins: [
    new HtmlPlugin({
      template: "./src/index.html",
      filename: "./index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(cesiumSource, "ThirdParty"),
          to: "static/Cesium/ThirdParty",
        },
        {
          from: path.join(cesiumSource, "Workers"),
          to: "static/Cesium/Workers",
        },
        { from: path.join(cesiumSource, "Assets"), to: "static/Cesium/Assets" },
        {
          from: path.join(cesiumSource, "Widgets"),
          to: "static/Cesium/Widgets",
        },
      ],
    }),
    new webpack.DefinePlugin({
      // Define relative base path in cesium for loading assets
      CESIUM_BASE_URL: JSON.stringify("static/Cesium/"),
    }),
  ],
  devServer: { open: true },
  module: {
    rules: [
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      { test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/, use: ["url-loader"] },
      { test: /\.js$/, use: "babel-loader", exclude: /node_modules/ },
    ],
    unknownContextCritical: false,
  },
  resolve: {
    fallback: {
      fs: "empty",
      Buffer: false,
      http: false,
      https: false,
      zlib: false,
      url: false,
    },
  },
};
