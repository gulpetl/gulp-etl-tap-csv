// const tapCsv = require('./src/plugin'); // Error: Cannot find module './src/plugin'
// import { csvStringifyNdjson } from 'gulp-etl-tap-csv'; // SyntaxError: Cannot use import statement outside a module (line:2)
const tapCsv = require('gulp-etl-tap-csv');

module.exports = function (RED) {
  function TapCsvNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function (msg) {
      // TODO: add a local config so settings can be changed on this node
      let configObj = tapCsv.extractConfig(null/*local.config*/, msg.config);

      let baseFileName = msg?.filename.split(/[\\/]/).pop().split('.')[0];
      // tapCsv.csvParseText(msg.payload, msg?.filename.split('[\\/]').pop().split('.')[0], configObj)
      tapCsv.csvParseText(msg.payload, baseFileName, configObj)
        .then((data) => {
          msg.payload = data;
          console.log("msg.config", msg.config)
          console.log("configObj", configObj)
        })
        .catch((err) => {
          node.error(err.message);
        })
        .finally(() => {
          node.send(msg);
        })
    })
  }

  RED.nodes.registerType("gulpetl-tap-csv", TapCsvNode);
}