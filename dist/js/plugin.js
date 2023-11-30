"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tapCsv = exports.extractConfig = exports.csvParseText = exports.convertCsvObjectToRecordLine = void 0;
const through2 = require('through2');
const PluginError = require("plugin-error");
const pkginfo = require('pkginfo')(module); // project package.json info into module.exports
const PLUGIN_NAME = module.exports.name;
const loglevel_1 = require("loglevel");
const log = (0, loglevel_1.getLogger)(PLUGIN_NAME); // get a logger instance based on the project name
log.setLevel((process.env.DEBUG_LEVEL || 'warn'));
const replaceExt = require("replace-ext");
const merge_1 = require("merge");
const csv_parse_1 = require("csv-parse");
const stream_transform_1 = require("stream-transform");
/**
 * Convert a standard object into an NDJSON line; suitable for calling directly or as a Handler for [stream-transform](https://csv.js.org/transform/handler/)
 * @param dataObj An object (from csvParse) representing a line
 * @param params A `params` object; may be passed in directly, or, when calling as a stream-transform handler it is passed as `options.params` .
 * NOTE: params is REQUIRED; if no params is passed when run as a Handler, the whole stream will fail quietly.
 * @returns A [RECORD Message](https://github.com/singer-io/getting-started/blob/master/docs/SPEC.md#record-message) created from dataObj, as a string
 */
function convertCsvObjectToRecordLine(dataObj, params) {
    // post-process line object
    const handleLine = (lineObj, _streamName) => {
        var _a, _b;
        if (((_a = params === null || params === void 0 ? void 0 : params.configObj) === null || _a === void 0 ? void 0 : _a.raw) || ((_b = params === null || params === void 0 ? void 0 : params.configObj) === null || _b === void 0 ? void 0 : _b.info)) {
            let newObj = createRecord(lineObj.record, _streamName);
            if (lineObj.raw)
                newObj.raw = lineObj.raw;
            if (lineObj.info)
                newObj.info = lineObj.info;
            lineObj = newObj;
        }
        else {
            lineObj = createRecord(lineObj, _streamName);
        }
        return lineObj;
    };
    try {
        let handledObj = handleLine(dataObj, (params === null || params === void 0 ? void 0 : params.streamName) || "");
        if (handledObj) {
            let handledLine = JSON.stringify(handledObj);
            log.debug(handledLine);
            return handledLine + '\n';
        }
    }
    catch (err) {
        // consider: don't blow up the stream here? OTOH, not sure what type of problem from csvParse would cause an error here, pretty serious..?
        throw new Error(err);
    }
    return null;
}
exports.convertCsvObjectToRecordLine = convertCsvObjectToRecordLine;
/**
 * Converts an [ndjson](https://ndjson.org/) input into an array of objects and passes the array to csvStringify for conversion to CSV
 * @param ndjsonLines May be a string or Buffer representing ndjson lines, or an array of json strings or an array of objects
 * @param configObj [CSV Stringify options object](https://csv.js.org/stringify/options/); optional
 * @returns A string representation of the CSV lines
 */
function csvParseText(csvLines, streamName, configObj = {}) {
    return new Promise((resolve, reject) => {
        // run csv-parse
        (0, csv_parse_1.parse)(csvLines, configObj, function (err, linesArray) {
            // this callback function runs when the parser finishes its work, returning an array parsed lines 
            // log.debug(PLUGIN_NAME + " data:",linesArray);
            if (err)
                reject(new PluginError(PLUGIN_NAME, err));
            // else resolve(data);
            let resultArray = [];
            // we'll call handleLine on each line
            for (let dataIdx in linesArray) {
                try {
                    let tempLine = convertCsvObjectToRecordLine(linesArray[dataIdx], { streamName, configObj });
                    if (tempLine) {
                        resultArray.push(tempLine);
                    }
                }
                catch (err) {
                    reject(new PluginError(PLUGIN_NAME, err));
                }
            }
            // let data:string = resultArray.join('\n') // this is more correct, avoiding a trailing newline on last line, but it doesn't match isStream()
            let data = resultArray.join("");
            resolve(data);
        });
    });
}
exports.csvParseText = csvParseText;
let localDefaultConfigObj = { columns: true };
/**
 * Merges config information for this plugin from all potential sources
 * @param specificConfigObj A configObj set specifically for this plugin
 * @param pipelineConfigObj A "super" configObj (e.g. file.data or msg.config) for the whole pipeline which may/may not apply to this plugin; if it
 * does, its parameters override any matching ones from specificConfigObj.
 * @param defaultConfigObj A default configObj, whose parameters are overridden by all others
 */
function extractConfig(specificConfigObj, pipelineConfigObj, defaultConfigObj = localDefaultConfigObj) {
    let configObj;
    try {
        if (pipelineConfigObj) {
            // look for a property based on our plugin's name; assumes a complex object meant for multiple plugins
            let dataObj = pipelineConfigObj[PLUGIN_NAME];
            // if we didn't find a config above, use the entire file.data object as our config
            if (!dataObj)
                dataObj = pipelineConfigObj;
            // merge superConfigObj config into our passed-in origConfigObj
            // merge.recursive(origConfigObj, dataObj); // <-- huge bug: can't mess with origConfigObj, because changes there will bleed into subsequent calls
            configObj = merge_1.default.recursive(true, defaultConfigObj, specificConfigObj, dataObj);
        }
        else
            configObj = merge_1.default.recursive(true, defaultConfigObj, specificConfigObj);
    }
    catch (_a) { }
    return configObj;
}
exports.extractConfig = extractConfig;
/** creates an object from an array, using as its keys a number representing the position in the original array */
function arrayToObject(arr) {
    let newObj = {};
    arr.forEach((val, idx) => {
        newObj[idx] = val;
    });
    return newObj;
}
/** wrap incoming recordObject in a Singer RECORD Message object*/
function createRecord(recordObject, streamName) {
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
function tapCsv(origConfigObj) {
    // creating a stream through which each file will pass - a new instance will be created and invoked for each file 
    // see https://stackoverflow.com/a/52432089/5578474 for a note on the "this" param
    const strm = through2.obj(function (file, encoding, cb) {
        let configObj = extractConfig(origConfigObj, file.data);
        const self = this;
        let returnErr = null;
        const parser = (0, csv_parse_1.parse)(configObj);
        try {
            file.path = replaceExt(file.path, '.ndjson');
        }
        catch (err) {
            console.error(err);
        }
        // set the stream name to the file name (without extension)
        let streamName = file.stem;
        if (file.isNull()) {
            // return empty file
            return cb(returnErr, file);
        }
        else if (file.isBuffer()) {
            csvParseText(file.contents, streamName, configObj)
                .then((data) => {
                file.contents = Buffer.from(data);
            })
                .catch((err) => {
                returnErr = new PluginError(PLUGIN_NAME, err);
            })
                .finally(() => {
                // we are done with file processing. Pass the processed file along
                log.debug('calling callback');
                cb(returnErr, file);
            });
        }
        else if (file.isStream()) {
            file.contents = file.contents
                .pipe(parser)
                .on('end', function () {
                // DON'T CALL THIS HERE. It MAY work, if the job is small enough. But it needs to be called after the stream is SET UP, not when the streaming is DONE.
                // Calling the callback here instead of below may result in data hanging in the stream--not sure of the technical term, but dest() creates no file, or the file is blank
                // cb(returnErr, file);
                // log.debug('calling callback')    
                log.debug('csv parser is done');
            })
                .on('data', function (data, err) {
                log.debug(data);
            })
                .on('error', function (err) {
                log.error(err);
                self.emit('error', new PluginError(PLUGIN_NAME, err));
            })
                // .pipe(transform(convertCsvObjectToRecordLine)) // wont work; options object is REQUIRED--stream will fail with odd behaviors...
                .pipe((0, stream_transform_1.transform)({ params: { streamName, configObj } }, convertCsvObjectToRecordLine))
                .on('error', function (err) {
                log.error(err);
                self.emit('error', new PluginError(PLUGIN_NAME, err));
            });
            // after our stream is set up (not necesarily finished) we call the callback
            log.debug('calling callback');
            cb(returnErr, file);
        }
    });
    return strm;
}
exports.tapCsv = tapCsv;
//# sourceMappingURL=plugin.js.map