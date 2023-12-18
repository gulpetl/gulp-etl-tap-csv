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
 * Converts a string/buffer CSV input into an a Message Stream
 * @param csvLines A string or Buffer representing CSV lines
 * @param streamName name to use for the "stream" property of each Message Stream record
 * @param configObj [CSV Stringify options object](https://csv.js.org/stringify/options/); optional
 * @returns A string representation of the CSV lines
 */
export declare function csvParseText(csvLines: string | Buffer, streamName: string, configObj?: Object): Promise<string>;
/**
 * Merges config information for this plugin from all potential sources
 * @param specificConfigObj A configObj set specifically for this plugin
 * @param pipelineConfigObj A "super" configObj (e.g. file.data or msg.config) for the whole pipeline which may/may not apply to this plugin; if it
 * does, its parameters override any matching ones from specificConfigObj.
 * @param defaultConfigObj A default configObj, whose parameters are overridden by all others
 */
export declare function extractConfig(specificConfigObj: any, pipelineConfigObj?: any, defaultConfigObj?: any): any;
export declare function tapCsv(origConfigObj: any): any;
export {};
