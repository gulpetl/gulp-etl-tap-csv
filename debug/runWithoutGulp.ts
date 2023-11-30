import { convertCsvObjectToRecordLine } from '../src/plugin'
import { parse } from 'csv-parse';
import { transform } from 'stream-transform';

/**
 * Run this plugin on a .csv file, converting it to an .ndjson file. As a wrapper for csv-parse, the main logic
 * in this plugin is in `convertCsvObjectToRecordLine`, which stringifies incoming object lines into RECORD Message
 * strings.
 * 
 * We demonstrate here that a gulp plugin can run without gulp. We are operating in "streaming" mode, working with the
 * nodejs stream provided by createReadStream.
 */
export function runWithoutGulp() {
    const configObj = {delimiter: ',', columns:true, raw:false, info:false};
    const csvParse = parse(configObj);
    
    require('fs').createReadStream('./testdata/cars.csv')
        .pipe(csvParse)
        // use a node transform stream to parse each line into an object and extract its main `record` property
        // .pipe(transform(convertCsvObjectToRecordLine)) // this wont work here; options.params object is REQUIRED--fails quietly, blowing up the whole stream
        .pipe(transform({params:{streamName:"streamName", configObj:configObj}},convertCsvObjectToRecordLine))
        .on("error", (data: any) => {
            console.error(data.message)
        })
        .on("data",(data:any)=>{
            console.log(data?.trim())
        })
        .pipe(process.stdout);
    
  }

runWithoutGulp();
