// through2 is a thin wrapper around node transform streams
var through = require('through2');
var PluginError = require('plugin-error');


const csvtojson=require("csvtojson");

// Consts
const PLUGIN_NAME = 'gulp-prefixer';

function prefixStream(prefixText:any) {
  var stream = through();
  stream.write(prefixText);
  return stream;
}

// Plugin level function(dealing with files)
export function gulpPrefixer(prefixText:any) {

  if (!prefixText) {
    throw new PluginError(PLUGIN_NAME, 'Missing prefix text!');
  }
  prefixText = new Buffer(prefixText); // allocate ahead of time

  // Creating a stream through which each file will pass
  return through.obj(function(file:any, enc:any, cb:any) {
    if (file.isNull()) {
      // return empty file
      return cb(null, file);
    }
    if (file.isBuffer()) {
      file.contents = Buffer.concat([prefixText, file.contents]);
    }
    if (file.isStream()) {
      file.contents = file.contents
      .pipe(prefixStream(prefixText))
      .pipe(csvtojson())
      .on("done",()=>{
        console.log('csvtojson is done')

        // DON'T CALL THIS HERE. It MAY work, if the job is small enough. But it needs to be called after the stream is SET UP, not when the streaming is DONE.
        // Calling cb here instead of below will result in data hanging in the stream--not sure of the technical term, but dest() creates no file, or the file is blank
        // cb(null, file);
        // console.log('calling callback')
    
      });
      console.log('stream setup done')
    }

    // after our stream is set up (not necessarily finished) we call the callback
    cb(null, file);
    console.log('calling callback')

  });

}
