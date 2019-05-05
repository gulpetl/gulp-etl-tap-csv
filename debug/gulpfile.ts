let gulp = require('gulp')
import {tapCsv} from '../src/plugin'

import * as loglevel from 'loglevel'
const log = loglevel.getLogger('gulpfile')
log.setLevel((process.env.DEBUG_LEVEL || 'warn') as log.LogLevelDesc)
// if needed, you can control the plugin's logging level separately from 'gulpfile' logging above
// const pluginLog = loglevel.getLogger(PLUGIN_NAME)
// pluginLog.setLevel('debug')

import * as rename from 'gulp-rename'
const errorHandler = require('gulp-error-handle'); // handle all errors in one handler, but still stop the stream if there are errors

const pkginfo = require('pkginfo')(module); // project package.json info into module.exports
const PLUGIN_NAME = module.exports.name;



function runTapCsv(callback: any) {
  log.info('gulp starting for ' + PLUGIN_NAME)
  return gulp.src('../testdata/*.csv',{buffer:false})
    .pipe(errorHandler(function(err:any) {
      log.error('Error: ' + err)
      callback(err)
    }))
    .pipe(tapCsv({columns:true, raw:true}))
    .pipe(rename({
      extname: ".ndjson",
    }))      
    .pipe(gulp.dest('../testdata/processed'))

    .on('end', function () {
      log.info('end')
      callback()
    })

}

    export function csvParseTest(callback: any) {

    const parse = require('csv-parse')
    const generate = require('csv-generate')
    const transform = require('stream-transform')
    
    // const generator = generate({
    //   length: 20
    // })
    // const parser = parse({
    //   delimiter: ','
    // })
    // const transformer = transform(function(record:any, callback:any){
    //   setTimeout(function(){
    //     callback(null, record.join(' ')+'\n')
    //   }, 500)
    // }, {
    //   parallel: 5
    // })
    // // generator.pipe(parser).pipe(transformer).pipe(process.stdout)

    // const readStream=require('fs').createReadStream('../testdata/cars.csv');
    // readStream.pipe(parser).pipe(process.stdout)

    var parser = parse({delimiter: ',', columns:true});
    
    require('fs').createReadStream('../testdata/cars.csv').pipe(parser)
    .on("data",(data:any)=>{
      console.log(data)
    });
    
  }

exports.default = gulp.series(runTapCsv)