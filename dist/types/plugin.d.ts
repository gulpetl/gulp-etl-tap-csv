/// <reference types="node" />
interface ConvertParams {
    streamName: string;
    configObj: any;
}
/**
 * Convert a standard object into an NDJSON line; suitable for calling directly or as a Handler for [stream-transform](https://csv.js.org/transform/handler/)
 * @param dataObj An object (from csvParse) representing a line
 * @param params A `params` object; may be passed in directly, or, when calling as a stream-transform handler it is passed as `options.params` .
 * NOTE: params is REQUIRED; if no params is passed when run as a Handler, the whole stream will fail quietly.
 * @returns A [RECORD Message](https://github.com/singer-io/getting-started/blob/master/docs/SPEC.md#record-message) created from dataObj, as a string
 */
export declare function convertCsvObjectToRecordLine(dataObj: Object, params?: ConvertParams | any): string | null;
/**
 * Converts an [ndjson](https://ndjson.org/) input into an array of objects and passes the array to csvStringify for conversion to CSV
 * @param ndjsonLines May be a string or Buffer representing ndjson lines, or an array of json strings or an array of objects
 * @param configObj [CSV Stringify options object](https://csv.js.org/stringify/options/); optional
 * @returns A string representation of the CSV lines
 */
export declare function csvParseText(csvLines: string | Buffer, streamName: string, configObj?: Object): Promise<string>;
export declare function tapCsv(origConfigObj: any): any;
export {};
