let gulp = require('gulp')
import {handlelines} from '../src/plugin'
export { handlelines, TransformCallback } from '../src/plugin';

import {gulpPrefixer} from '../src/simpleplugin'


import * as loglevel from 'loglevel'
const log = loglevel.getLogger('gulpfile')
log.setLevel((process.env.DEBUG_LEVEL || 'warn') as log.LogLevelDesc)
import * as rename from 'gulp-rename'
const errorHandler = require('gulp-error-handle'); // handle all errors in one handler, but still stop the stream if there are errors

import * as vinylPaths from 'vinyl-paths';
import * as del from 'del';

const pkginfo = require('pkginfo')(module); // project package.json info into module.exports
const PLUGIN_NAME = module.exports.name;

// control the plugin's logging level separately from this 'gulpfile' logging
//const pluginLog = loglevel.getLogger(PLUGIN_NAME)
//pluginLog.setLevel('debug')


// allCaps makes sure all string properties on the top level of lineObj have values that are all caps
const allCaps = (lineObj: object): object => {
  log.debug(lineObj)
  for (let propName in lineObj) {
    let obj = (<any>lineObj)
    if (typeof (obj[propName]) == "string")
      obj[propName] = obj[propName].toUpperCase()
  }
  
  // for testing: cause an error
  // let err; 
  // let zz = (err as any).nothing;

  return lineObj
}


function demonstrateHandlelines(callback: any) {
  log.info('gulp starting for ' + PLUGIN_NAME)
  return gulp.src('../testdata/*.csv',{buffer:false})
      .pipe(errorHandler(function(err:any) {
        log.error('whoops: ' + err)
        callback(err)
      }))
      // call allCaps function above for each line
      // .pipe(handlelines({}, { transformCallback: allCaps }))
      // call the built-in handleline callback (by passing no callbacks to override the built-in default), which adds an extra param
      .pipe(handlelines({}))
      .pipe(rename({
        extname: ".ndjson",
      }))      
      .pipe(gulp.dest('../testdata/processed'))
      // .pipe(vinylPaths((path) => {
      //   // experimenting with deleting files, per https://github.com/gulpjs/gulp/blob/master/docs/recipes/delete-files-folder.md.
      //   // This actually deletes the NEW files, not the originals! Try gulp-revert-path
      //   return del(path, {force:true})
      // }))
      .on('end', function () {
        log.info('end')
        callback()
      })
    }



    function test(callback: any) {
      log.info('This seems to run only after a successful run of demonstrateHandlelines! Do deletions here?')
      callback()
    }




    export function simple(callback: any) {
      log.info('gulp starting for ' + PLUGIN_NAME)
      return gulp.src('../testdata/*.csv',{buffer:false})
          .pipe(errorHandler(function(err:any) {
            log.error('whoops: ' + err)
            callback(err)
          }))
          .pipe(gulpPrefixer('test: '))
          .pipe(rename({
            suffix: "-fixed",
          }))      
          .pipe(gulp.dest('../testdata/processed'))
          // .pipe(vinylPaths((path) => {
          //   // experimenting with deleting files, per https://github.com/gulpjs/gulp/blob/master/docs/recipes/delete-files-folder.md.
          //   // This actually deletes the NEW files, not the originals! Try gulp-revert-path
          //   return del(path, {force:true})
          // }))
          .on('end', function () {
            log.info('end')
            callback()
          })
        }



    function test2(callback: any) {

    const parse = require('csv-parse')
    const generate = require('csv-generate')
    const transform = require('stream-transform')
    
    const generator = generate({
      length: 20
    })
    const parser = parse({
      delimiter: ':'
    })
    const transformer = transform(function(record:any, callback:any){
      setTimeout(function(){
        callback(null, record.join(' ')+'\n')
      }, 500)
    }, {
      parallel: 5
    })
    generator.pipe(parser).pipe(transformer).pipe(process.stdout)
  }

exports.default = gulp.series(demonstrateHandlelines)
// exports.default = gulp.series(test2)
// exports.default = gulp.series(simple)