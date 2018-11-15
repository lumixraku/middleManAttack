var HttpProxyRules = require("http-proxy-rules");
// Set up proxy rules instance
var proxyRules = new HttpProxyRules({
    rules: {
      ".*/tetrisss/page": "http://10.8.160.227:9727/tetris/page" // Rule (1)
    },
    default: "" // default target
  });

module.exports = proxyRules;