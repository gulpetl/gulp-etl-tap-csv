const through2 = require('through2')
import Vinyl = require('vinyl')
import PluginError = require('plugin-error');
const pkginfo = require('pkginfo')(module); // project package.json info into module.exports
const PLUGIN_NAME = module.exports.name;
import * as loglevel from 'loglevel'
const log = loglevel.getLogger(PLUGIN_NAME) // get a logger instance based on the project name
log.setLevel((process.env.DEBUG_LEVEL || 'warn') as log.LogLevelDesc)

const parse = require('csv-parse')

/* This is a gulp-etl plugin. It is compliant with best practices for Gulp plugins (see
https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md#what-does-a-good-plugin-look-like ),
and like all gulp-etl plugins it accepts a configObj as its first parameter */
export function tapCsv(configObj: any) {

  // post-process line object
  const handleLine = (lineObj: object): object | null => {

    return lineObj
  }

  let transformer = through2.obj(); // new transform stream, in object mode
  // transformer is designed to follow csv-parse, which emits objects, so dataObj is an Object. We will finish by converting dataObj to a text line
  transformer._transform = function (dataObj: Object, encoding: string, callback: Function) {
    let returnErr: any = null
    try {
      let handledObj = handleLine(dataObj)
      if (handledObj) {
        let handledLine = JSON.stringify(handledObj)
        log.debug(handledLine)
        this.push(handledLine + '\n');
      }
    } catch (err) {
      returnErr = new PluginError(PLUGIN_NAME, err);
    }

    callback(returnErr)
  }


  // creating a stream through which each file will pass
  // see https://stackoverflow.com/a/52432089/5578474 for a note on the "this" param
  const strm = through2.obj(function (this: any, file: Vinyl, encoding: string, cb: Function) {
    const self = this
    let returnErr: any = null

    if (file.isNull()) {
      // return empty file
      return cb(returnErr, file)
    }
    else if (file.isBuffer()) {
      // strArray will hold file.contents, split into lines
      const strArray = (file.contents as Buffer).toString().split(/\r?\n/)
      let tempLine: any
      let resultArray = [];
      // we'll call handleLine on each line
      for (let dataIdx in strArray) {
        try {
          let lineObj;
          if (strArray[dataIdx].trim() != "") lineObj = JSON.parse(strArray[dataIdx]);
          tempLine = handleLine(lineObj)
          if (tempLine){
            resultArray.push(JSON.stringify(tempLine) + '\n');
          }
        } catch (err) {
          returnErr = new PluginError(PLUGIN_NAME, err);
        }
      }
      let data:string = resultArray.join('')
      log.debug(data)
      file.contents = Buffer.from(data)

      // finishHandler();

      // send the transformed file through to the next gulp plugin, and tell the stream engine that we're done with this file
      cb(returnErr, file)
    }
    else if (file.isStream()) {
      const parser = parse(configObj)

      file.contents = file.contents
        .pipe(parser)
        .on('done', function (error:any) {
          // self.push(file);
          // cb(returnErr);
          // finishHandler();
          log.debug('done')
        })
        // .on('data', function (data:any, err: any) {
        //   log.debug(data)
        // })
        .on('error', function (err: any) {
          log.error(err)
          cb(new PluginError(PLUGIN_NAME, err))
        })
        .pipe(transformer)
    }

    cb(returnErr, file);
  })

  // startHandler();
  return strm
}