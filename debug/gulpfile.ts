let gulp = require('gulp')
import { tapCsv } from '../src/plugin'

import * as loglevel from 'loglevel'
const log = loglevel.getLogger('gulpfile')
log.setLevel((process.env.DEBUG_LEVEL || 'warn') as loglevel.LogLevelDesc)
// if needed, you can control the plugin's logging level separately from 'gulpfile' logging above
// const pluginLog = loglevel.getLogger(PLUGIN_NAME)
// pluginLog.setLevel('debug')

import * as rename from 'gulp-rename'
const errorHandler = require('gulp-error-handle'); // handle all errors in one handler, but still stop the stream if there are errors

const pkginfo = require('pkginfo')(module); // project package.json info into module.exports
const PLUGIN_NAME = module.exports.name;

import Vinyl = require('vinyl') 

let gulpBufferMode = false;


function switchToBuffer(callback: any) {
  gulpBufferMode = true;

  callback();
}

function runTapCsv(callback: any) {
  log.info('gulp task starting for ' + PLUGIN_NAME)

  return gulp.src('../testdata/*.csv',{buffer:gulpBufferMode})
    .pipe(errorHandler(function(err:any) {
      log.error('Error: ' + err),
      callback(err)
    }))
    .on('data', function (file:Vinyl) {
      log.info('Starting processing on ' + file.basename)
    })    
    .pipe(tapCsv({/*raw:true, info:true*/  column_list_mode: true, normalize_column_names:true, rename_duplicates_columns:true}))
    /*.pipe(rename({
      extname: ".ndjson",
    }))   */   
    .pipe(gulp.dest('../testdata/processed'))
    .on('data', function (file:Vinyl) {
      log.info('Finished processing on ' + file.basename)
    })    
    .on('end', function () {
      log.info('gulp task complete')
      callback()
    })

}

export function csvParseWithoutGulp(callback: any) {

  const parse = require('csv-parse')

  var parser = parse({delimiter: ',', columns:true});
  
  require('fs').createReadStream('../testdata/cars.csv').pipe(parser)
  .on("data",(data:any)=>{
    console.log(data)
  });
  
}

exports.default = gulp.series(runTapCsv)
exports.runTapCsvBuffer = gulp.series(switchToBuffer, runTapCsv)