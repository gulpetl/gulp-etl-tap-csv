let gulp = require('gulp')
import { tapCsv } from '../src/plugin'

import * as loglevel from 'loglevel'
const log = loglevel.getLogger('gulpfile')
log.setLevel((process.env.DEBUG_LEVEL || 'warn') as loglevel.LogLevelDesc)
// if needed, you can control the plugin's logging level separately from 'gulpfile' logging above
// const pluginLog = loglevel.getLogger(PLUGIN_NAME)
// pluginLog.setLevel('debug')

const errorHandler = require('gulp-error-handle'); // handle all errors in one handler, but still stop the stream if there are errors

const pkginfo = require('pkginfo')(module); // project package.json info into module.exports
const PLUGIN_NAME = module.exports.name;

import * as Vinyl from 'vinyl'

let gulpBufferMode = false;

function switchToBuffer(callback: any) {
  gulpBufferMode = true;

  callback();
}

function runTapCsv(callback: any) {
  log.info('gulp task starting for ' + PLUGIN_NAME)

  return gulp.src('../testdata/*.csv',{buffer:gulpBufferMode})
    .on('data', function (file: Vinyl) {
      log.info('Adding options via gulp-data API (file.data) to ' + file.basename + "...")
      file.data = { columns: false }
    })
    .on('data', function (file: Vinyl) {
      log.info('...or, setting file.data this way allows you to set options for multiple plugins in the same pipeline without conflicts')
      let allOptions = file.data || {}; // set allOptions to existing file.data or, if none exists, set to an empty object
      allOptions["gulp-etl-tap-csv"] = { columns: true }; // set options on file.data for a specific plugin. This will override the more general settings above.
    })
    .pipe(errorHandler(function(err:any) {
      log.error('Error: ' + err)
      callback(err)
    }))
    .on('data', function (file:Vinyl) {
      log.info('Starting processing on ' + file.basename)
    })
    // NOTE: configObj options below (e.g. raw, columns, etc.) are overridden by gulp-data API (file.data) options set above
    .pipe(tapCsv({raw:true, columns:false/*, info:true */}))
    .on('data', function (file:Vinyl) {
      log.info('...processing on ' + file.basename)
    })    
    .pipe(gulp.dest('../testdata/processed'))
    .on('end', function () {
      log.info('gulp task complete')
      callback()
    })

}
exports.default = gulp.series(runTapCsv)
exports.runTapCsvBuffer = gulp.series(switchToBuffer, runTapCsv)