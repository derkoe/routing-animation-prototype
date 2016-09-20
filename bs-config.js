var historyApiFallback = require('connect-history-api-fallback');

module.exports = {
  "files": [
    "index.html",
    "app.js"
  ],
  server: {
    baseDir: ".",
    middleware: [historyApiFallback()]
  }
};
