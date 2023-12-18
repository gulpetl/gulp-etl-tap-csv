// const tapCsv = require('./src/plugin'); // Error: Cannot find module './src/plugin'
// import { csvStringifyNdjson } from 'gulp-etl-tap-csv'; // SyntaxError: Cannot use import statement outside a module (line:2)
const tapCsv = require('gulp-etl-tap-csv');

module.exports = function (RED) {
  function TapCsvNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function (msg) {
      let configObj = tapCsv.extractConfig(null/*local.config*/, msg.config);

      if (!msg.topic?.startsWith("gulp")) {
        let fileNameStem = msg?.filename.split(/[\\/]/).pop().split('.')[0];
        tapCsv.csvParseText(msg.payload, fileNameStem, configObj)
          .then((data) => {
            msg.payload = data;
            // console.log("msg.config", msg.config)
            // console.log("configObj", configObj)
          })
          .catch((err) => {
            node.error(err.message);
          })
          .finally(() => {
            node.send(msg);
          })
      }
      else {
        if (msg.topic == "gulp-initialize") {
          msg.plugins.push({ name: config.type, init: () => tapCsv.tapCsv(configObj) });
        }

        node.send(msg);
      }
    })
  }

  RED.nodes.registerType("gulpetl-tap-csv", TapCsvNode);
}