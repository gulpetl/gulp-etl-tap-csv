const through2 = require('through2')
import Vinyl = require('vinyl')
import PluginError = require('plugin-error');
const pkginfo = require('pkginfo')(module); // project package.json info into module.exports
const PLUGIN_NAME = module.exports.name;
import * as loglevel from 'loglevel'
const log = loglevel.getLogger(PLUGIN_NAME) // get a logger instance based on the project name
log.setLevel((process.env.DEBUG_LEVEL || 'warn') as loglevel.LogLevelDesc)
import * as fs from 'fs'
const ps = require('pause-stream')()
const ReadableStreamClone = require("readable-stream-clone");
const cloneDeep = require('clone-deep');
const parse = require('csv-parse')
import * as syncparse from 'csv-parse/lib/sync'
import { any } from 'expect';



/** wrap incoming recordObject in a Singer RECORD Message object*/
function createRecord(recordObject:Object, streamName: string) : any {
  return {type:"RECORD", stream:streamName, record:recordObject}
}


async function previewFirstLineStream (stream:any) : Promise<string> {
  return new Promise((resolve, reject) => {
    let header : string = "";
    let allData : string = "";

    try {
      stream.on('data', (data: any) => {
        allData += data
        let lines = allData.split(/\r?\n/)
        if (lines.length > 1 && header == "") {
          header = lines[0]
          stream.destroy();
         // stream.pause()
          // stream.unpipe()
          resolve(header || allData)
        }
      })
      stream.on('close', () => {
        resolve(header || allData)
      })
    }
    catch (err) {
      reject(err)
    }
  });
}


async function column_list_mode(this: any, configObj: any, file: Vinyl){
  const self = this;
  //configurations for column_list_mode
  configObj.columns = false;
  configObj.from = 0;
  configObj.to = 1;//just gets the headers
  let firstLine: any

  if (file.isStream()) {
    // grab first line of incoming file, which may be needed for some configObj options
    try {
      let z = new ReadableStreamClone(file.contents);
      let zz = new ReadableStreamClone(file.contents);
      let templine = await previewFirstLineStream(z)
      let header = syncparse(templine)
      firstLine = header[0]      
    }
    catch (err) {
      log.error(err);
      self.emit('error', new PluginError(PLUGIN_NAME, err));
    }
  }

  if(file.isBuffer()){
    try{  
     //let templine: any = previewFirstLineBuffer(file)

    let tempStr = file.contents.toString();
    let templine = tempStr.split(/\r?\n/)[0];
    let header = syncparse(templine)
    firstLine = header[0]
    console.log(firstLine)
    }
    catch(err){
      log.error(err);
      self.emit('error', new PluginError(PLUGIN_NAME, err));
    }
  }
  return firstLine;
}


function regex_normalize_header(header: any){
    let lineObj = header;
    for(let Index in lineObj){
     lineObj[Index]= lineObj[Index].replace(/[^a-zA-Z0-9]/g, "")
    }
    return lineObj;
}


function renameduplicates(headers: any){
  let dulplicate_headers_index = 1;
  for(let firstIndex in headers){
    for (let secondIndex in headers){
      if((headers[firstIndex] == headers[secondIndex]) && firstIndex != secondIndex){
        headers[firstIndex] = "_" + dulplicate_headers_index + headers[firstIndex];
        dulplicate_headers_index ++;
      }
    }
  }
  return headers;
}

function createkeyvalueobject(originalheader: any, changedheader: any){
  var arrayofobject=[];
  
  for(let Index in originalheader){
    var object ={
      originalname: originalheader[Index],
      key: changedheader[Index],
      header: originalheader[Index],
      name: changedheader[Index],
    }
    arrayofobject.push(object);
  }
  return arrayofobject;

}


/* This is a gulp-etl plugin. It is compliant with best practices for Gulp plugins (see
https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md#what-does-a-good-plugin-look-like ),
and like all gulp-etl plugins it accepts a configObj as its first parameter */
export function tapCsv(configObj: any) {
  if (!configObj) configObj = {}
  if (!configObj.columns) configObj.columns = true // we don't allow false for columns; it results in arrays instead of objects for each record
  if (!configObj.column_list_mode) configObj.column_list_mode = false //if the falsey value is passed then it will assume the column_list_mode to be false
  if (!configObj.normalize_column_names) configObj.normalize_column_names = false
  if (!configObj.rename_duplicates_columns) configObj.rename_duplicates_columns= false



  // creating a stream through which each file will pass - a new instance will be created and invoked for each file 
  // see https://stackoverflow.com/a/52432089/5578474 for a note on the "this" param
  const strm = through2.obj(async function (this: any, file: Vinyl, encoding: string, cb: Function) {
    const self = this
    let returnErr: any = null
    let firstLine: string
    let zz

    if(configObj.column_list_mode || configObj.normalize_column_names || configObj.rename_duplicates_columns){
      let headersobj = await column_list_mode(configObj, file);
      let originalheader = cloneDeep(headersobj)
      if(configObj.normalize_column_names){
        headersobj = regex_normalize_header(headersobj);//normalizes the headers
      }
      if(configObj.rename_duplicates_columns){
        headersobj = renameduplicates(headersobj);//renames duplicates with starting with _1
      }
      let finalobject = createkeyvalueobject(originalheader, headersobj)

      if(configObj.column_list_mode == 'reversible'){
        file.contents= Buffer.from(JSON.stringify(finalobject));
        file.extname = '.json';
        file.stem = file.stem + '.column_list.reversible';
      }
      else{
        file.contents= Buffer.from(JSON.stringify(headersobj))
        file.extname = '.json';
        file.stem = file.stem + '.column_list.simple';
      }
      
      //file.contents= Buffer.from(JSON.stringify(finalobject));//headers are dumped as key value pairs
      //file.contents= Buffer.from(JSON.stringify(originalheader))//headers are dumped as value 
      return cb(returnErr, file)
    }
    else {
      const parser = parse(configObj)

      // post-process line object
      const handleLine = (lineObj: any, _streamName : string): object | null => {
        if (parser.options.raw || parser.options.info) {
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
  
      function newTransformer(streamName : string) {
  
        let transformer = through2.obj(); // new transform stream, in object mode
    
        // transformer is designed to follow csv-parse, which emits objects, so dataObj is an Object. We will finish by converting dataObj to a text line
        transformer._transform = function (dataObj: Object, encoding: string, callback: Function) {
          let returnErr: any = null
          try {
            let handledObj = handleLine(dataObj, streamName)
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
    
        return transformer
      }
  
      // set the stream name to the file name (without extension)
      let streamName : string = file.stem
  
      if (file.isNull()) {
        // return empty file
        return cb(returnErr, file)
      }
      else if (file.isBuffer()) {
  
  
        parse(file.contents as Buffer, configObj, function(err:any, linesArray : []){
          // this callback function runs when the parser finishes its work, returning an array parsed lines 
          let tempLine: any
          let resultArray = [];
          // we'll call handleLine on each line
          for (let dataIdx in linesArray) {
            console.log(linesArray[dataIdx])
            try {
              let lineObj = linesArray[dataIdx]
              tempLine = handleLine(lineObj, streamName)
              if (tempLine){
                let tempStr= JSON.stringify(tempLine)
                log.debug(tempStr)
                resultArray.push(tempStr);
              }
            } catch (err) {
              returnErr = new PluginError(PLUGIN_NAME, err);
            }
          }
          let data:string = resultArray.join('\n')
  
          file.contents = Buffer.from(data)
          
          // we are done with file processing. Pass the processed file along
          log.debug('calling callback')    
          cb(returnErr, file);    
        })
  
      }
      else if (file.isStream()) {
        let zz = new ReadableStreamClone(file.contents);
        file.contents = zz//file.contents
          .pipe(parser)
          .on('end', function () {
  
            // DON'T CALL THIS HERE. It MAY work, if the job is small enough. But it needs to be called after the stream is SET UP, not when the streaming is DONE.
            // Calling the callback here instead of below may result in data hanging in the stream--not sure of the technical term, but dest() creates no file, or the file is blank
            // cb(returnErr, file);
            // log.debug('calling callback')    
  
            log.debug('csv parser is done')
          })
          // .on('data', function (data:any, err: any) {
          //   log.debug(data)
          // })
          .on('error', function (err: any) {
            log.error(err)
            self.emit('error', new PluginError(PLUGIN_NAME, err));
          })
          .pipe(newTransformer(streamName))
  
        // after our stream is set up (not necesarily finished) we call the callback
        log.debug('calling callback')    
        cb(returnErr, file);
      }
    }


  })

  return strm
}