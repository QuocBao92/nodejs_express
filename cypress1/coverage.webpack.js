module.exports = {
  module: {
    rules: [
      {
        enforce: "post",
        exclude: [/\.(e2e|spec)\.(ts|js)$/, /node_modules/, /(ngfactory|ngstyle)\.js/],
        include: require("path").join(__dirname, "..", "src"),
        loader: "istanbul-instrumenter-loader",
        options: { esModules: true },
        test: /\.(js|ts)$/,
      },
    ],
  },
};
