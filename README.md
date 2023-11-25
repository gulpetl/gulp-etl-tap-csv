# gulp-etl-tap-csv

This plugin  converts CSV files to **gulp-etl** **Message Stream** files; originally adapted from the [gulp-etl-handlelines](https://github.com/gulpetl/gulp-etl-handlelines) model plugin. It is a **gulp-etl** wrapper for [csv-parse](https://csv.js.org/parse/).

This is a **[gulp-etl](http://gulpetl.com/)** plugin, and as such it is a [gulp](https://gulpjs.com/) plugin. **gulp-etl** plugins work with [ndjson](http://ndjson.org/) data streams/files which we call **Message Streams** and which are compliant with the [Singer specification](https://github.com/singer-io/getting-started/blob/master/docs/SPEC.md#output). In the **gulp-etl** ecosystem, **taps** tap into an outside format or system (in this case, a CSV file) and convert their contents/output to a Message Stream, and **targets** convert/output Message Streams to an outside format or system. In this way, these modules can be stacked to convert from one format or system to another, either directly or with tranformations or other parsing in between. Message Streams look like this:

``` ndjson
{"type": "SCHEMA", "stream": "users", "key_properties": ["id"], "schema": {"required": ["id"], "type": "object", "properties": {"id": {"type": "integer"}}}}
{"type": "RECORD", "stream": "users", "record": {"id": 1, "name": "Chris"}}
{"type": "RECORD", "stream": "users", "record": {"id": 2, "name": "Mike"}}
{"type": "SCHEMA", "stream": "locations", "key_properties": ["id"], "schema": {"required": ["id"], "type": "object", "properties": {"id": {"type": "integer"}}}}
{"type": "RECORD", "stream": "locations", "record": {"id": 1, "name": "Philadelphia"}}
{"type": "STATE", "value": {"users": 2, "locations": 1}}
```

## Usage

**gulp-etl** plugins accept a configObj as the first parameter; the configObj
will contain any info the plugin needs. For this plugin the configObj is the "Options" object for [csv-parse](https://csv.js.org/parse/), described [here](https://csv.js.org/parse/options/); the only differences are around the `columns` option.

### [`columns`](https://csv.js.org/parse/options/columns/)

 If its `columns` option is *false* `csv-parse` returns arrays for each row instead of objects, but the Singer spec [specifies objects](https://github.com/singer-io/getting-started/blob/master/docs/SPEC.md#record-message) ("JSON maps") for the `record` property. So, we default to *true* (which tries to auto-discover column names from first line, and returns lines as objects), and if you set `columns` to *false*, the arrays returned will be converted to objects: e.g. `["valueA", "valueB"]` becomes `{"0":"valueA", "1":"valueB"}`.

### Sample gulpfile.js

``` javascript
/* parse all .CSV files in a folder into Message Stream files in a different folder */

let gulp = require('gulp')
var rename = require('gulp-rename')
var tapCsv = require('gulp-etl-tap-csv').tapCsv

exports.default = function() {
    return gulp.src('data/*.csv')
    .pipe(tapCsv({ columns:true }))
    .pipe(rename({ extname: ".ndjson" })) // rename to *.ndjson
    .pipe(gulp.dest('output/'));
}
```

### gulp-data
This plugin supports the use of the [gulp-data](https://github.com/colynb/gulp-data#readme) api for passing in its configObj parameter. This
allows data/options from the pipeline to be used to create options passed to this plugin when it runs. 

See the demonstration in `debug/gulpfile.ts` for usage examples.

### Quick Start for Coding on This Plugin

* Dependencies:
* [git](https://git-scm.com/downloads)
* [nodejs](https://nodejs.org/en/download/releases/) - At least v6.3 (6.9 for Windows) required for TypeScript debugging
* npm (installs with Node)
* typescript - installed as a development dependency
* Clone this repo and run `npm install` to install npm packages
* Debug: with [VScode](https://code.visualstudio.com/download) use `Open Folder` to open the project folder, then hit F5 to debug. This runs without compiling to javascript using [ts-node](https://www.npmjs.com/package/ts-node)
* Test: `npm test` or `npm t`
* Compile to javascript: `npm run build`

### Testing

We are using [Jest](https://facebook.github.io/jest/docs/en/getting-started.html) for our testing. Each of our tests are in the `test` folder.

* Run `npm test` to run the test suites

Note: This document is written in [Markdown](https://daringfireball.net/projects/markdown/). We like to use [Typora](https://typora.io/) and [Markdown Preview Plus](https://chrome.google.com/webstore/detail/markdown-preview-plus/febilkbfcbhebfnokafefeacimjdckgl?hl=en-US) for our Markdown work..
