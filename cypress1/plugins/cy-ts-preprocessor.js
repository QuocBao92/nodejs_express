const wp = require("@cypress/webpack-preprocessor");

const webpackOptions = {
  module: {
    rules: [
      {
        exclude: [/node_modules/],
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};

const options = {
  webpackOptions,
};

module.exports = wp(options);
