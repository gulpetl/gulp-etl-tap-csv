const through2 = require('through2')
import Vinyl = require('vinyl')
import PluginError = require('plugin-error');
const pkginfo = require('pkginfo')(module); // project package.json info into module.exports
export const PLUGIN_NAME = module.exports.name;
import { getLogger, LogLevelDesc } from 'loglevel'
const log = getLogger(PLUGIN_NAME) // get a logger instance based on the project name
log.setLevel((process.env.DEBUG_LEVEL || 'warn') as LogLevelDesc)
import replaceExt = require('replace-ext');

import { parse } from 'csv-parse';
import { transform } from 'stream-transform';
import { extractConfig } from '@gulpetl/node-red-core';
import { config } from 'process';

export let localDefaultConfigObj: any = { columns: false, asdf:"fdsa" }; // default to auto-discover column names from first line

interface ConvertParams {
  streamName: string;
  configObj: any
}

/**
 * Convert a standard object into an JSONL line; suitable for calling directly or as a Handler for [stream-transform](https://csv.js.org/transform/handler/)
 * @param dataObj An object (from csvParse) representing a line
 * @param params A `params` object; may be passed in directly, or, when calling as a stream-transform handler it is passed as `options.params` .
 * NOTE: params is REQUIRED; if no params is passed when run as a Handler, the whole stream will fail quietly.
 * @returns A [RECORD Message](https://github.com/singer-io/getting-started/blob/master/docs/SPEC.md#record-message) created from dataObj, as a string
 */
export function convertCsvObjectToRecordLine(dataObj: Object, params?: ConvertParams | any): string | null {

  // post-process line object
  const handleLine = (lineObj: any, _streamName: string): object | null => {
    if (params?.configObj?.raw || params?.configObj?.info) {
      let newObj = createRecord(lineObj.record, _streamName)
      if (lineObj.raw) newObj.raw = lineObj.raw
      if (lineObj.info) newObj.info = lineObj.info
      lineObj = newObj
    }
    else {
      lineObj = createRecord(lineObj, _streamName)
    }
    return lineObj
  }

  try {
    let handledObj = handleLine(dataObj, params?.streamName || "")
    if (handledObj) {
      let handledLine = JSON.stringify(handledObj)
      log.debug(handledLine);
      return handledLine + '\n';
    }
  } catch (err: any) {
    // consider: don't blow up the stream here? OTOH, not sure what type of problem from csvParse would cause an error here, pretty serious..?
    throw new Error(err);
  }

  return null;
}

/**
 * Converts a string/buffer CSV input into an a Message Stream
 * @param csvLines A string or Buffer representing CSV lines
 * @param streamName name to use for the "stream" property of each Message Stream record
 * @param configObj [CSV Stringify options object](https://csv.js.org/stringify/options/); optional
 * @returns A string representation of the CSV lines
 */
export function csvParseText(csvLines: string | Buffer, streamName: string, configObj: Object = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    // run csv-parse
    parse(csvLines, configObj, function (err: any, linesArray: []) {
      // this callback function runs when the parser finishes its work, returning an array parsed lines 
      // log.debug(PLUGIN_NAME + " data:",linesArray);
      if (err) reject(new PluginError(PLUGIN_NAME, err))
      // else resolve(data);
      let resultArray = [];
      // we'll call handleLine on each line
      for (let dataIdx in linesArray) {
        try {
          let tempLine = convertCsvObjectToRecordLine(linesArray[dataIdx], { streamName, configObj });
          if (tempLine) {
            resultArray.push(tempLine);
          }
        } catch (err) {
          reject(new PluginError(PLUGIN_NAME, err as Error));
        }
      }
      // let data:string = resultArray.join('\n') // this is more correct, avoiding a trailing newline on last line, but it doesn't match isStream()
      let data: string = resultArray.join("")

      resolve(data);
    })
  })
}

/** creates an object from an array, using as its keys a number representing the position in the original array */
function arrayToObject(arr: Array<any>): Object {
  let newObj: any = {};
  arr.forEach((val: any, idx: number) => {
    newObj[idx] = val;
  })

  return newObj;
}

/** wrap incoming recordObject in a Singer RECORD Message object*/
function createRecord(recordObject: Object, streamName: string): any {
  let rec = recordObject;
  // if configObj.columns is falsey data is returned as an array, but the Singer Spec requires a "JSON map" (i.e. an object), so
  // we convert an array to an object to comply with the spec
  if (Array.isArray(recordObject)) {
    //
    rec = arrayToObject(recordObject);
  }

  return { type: "RECORD", stream: streamName, record: rec };
}

/* This is a gulp-etl plugin. It is compliant with best practices for Gulp plugins (see
https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md#what-does-a-good-plugin-look-like ),
and like all gulp-etl plugins it accepts a configObj as its first parameter */
export function tapCsv(origConfigObj: any) {

  // creating a stream through which each file will pass - a new instance will be created and invoked for each file 
  // see https://stackoverflow.com/a/52432089/5578474 for a note on the "this" param
  const strm = through2.obj(function (this: any, file: Vinyl, encoding: string, cb: Function) {

    let configObj: any = extractConfig(undefined, file.data, PLUGIN_NAME, origConfigObj, localDefaultConfigObj);
    const self = this
    let returnErr: any = null
    const parser = parse(configObj)


    try {
      file.path = replaceExt(file.path, '.jsonl')
    }
    catch (err: any) {
      console.error(err);
    }

    // set the stream name to the file name (without extension)
    let streamName: string = file.stem

    if (file.isNull()) {
      // return empty file
      return cb(returnErr, file)
    }
    else if (file.isBuffer()) {
      csvParseText(file.contents, streamName, configObj)
        .then((data: any) => {
          file.contents = Buffer.from(data)
        })
        .catch((err: any) => {
          returnErr = new PluginError(PLUGIN_NAME, err);
        })
        .finally(() => {
          // we are done with file processing. Pass the processed file along
          log.debug('calling callback')
          cb(returnErr, file);
        })
    }
    else if (file.isStream()) {
      file.contents = file.contents
        .pipe(parser)
        .on('end', function () {

          // DON'T CALL THIS HERE. It MAY work, if the job is small enough. But it needs to be called after the stream is SET UP, not when the streaming is DONE.
          // Calling the callback here instead of below may result in data hanging in the stream--not sure of the technical term, but dest() creates no file, or the file is blank
          // cb(returnErr, file);
          // log.debug('calling callback')    

          log.debug('csv parser is done')
        })
        .on('data', function (data: any, err: any) {
          log.debug(data)
        })
        .on('error', function (err: any) {
          log.error(err)
          self.emit('error', new PluginError(PLUGIN_NAME, err));
        })
        // .pipe(transform(convertCsvObjectToRecordLine)) // wont work; options object is REQUIRED--stream will fail with odd behaviors...
        .pipe(transform({ params: { streamName, configObj } }, convertCsvObjectToRecordLine))
        .on('error', function (err: any) {
          log.error(err)
          self.emit('error', new PluginError(PLUGIN_NAME, err));
        });

      // after our stream is set up (not necesarily finished) we call the callback
      log.debug('calling callback')
      cb(returnErr, file);
    }

  })

  return strm
}