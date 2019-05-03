const csv=require('csvtojson');
 
const readStream=require('fs').createReadStream('testdata/cars.csv');
 
//const writeStream=request.put('http://mysite.com/obj.json');
 
readStream.pipe(csv()).pipe(process.stdout);