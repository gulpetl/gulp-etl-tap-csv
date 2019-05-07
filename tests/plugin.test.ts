import tapCsv from '../src/plugin';
const from = require('from2');
const Vinyl = require('vinyl');


describe('plugin tests', () => {

    test('Works with Vinyl file as Buffer', (done) => {
        let fakeFile = new Vinyl({
            path:"cars.csv",
            contents: Buffer.from('carModel,price,color\n"Audi",10000,"blue"\n"BMW",15000,"red"')
        })

        from.obj([fakeFile]).pipe(tapCsv({columns:true}))
            .once('data', function (file: any) {
                expect(Vinyl.isVinyl(file)).toBeTruthy()
                expect(file.isBuffer()).toBeTruthy()
                expect(file.contents.toString()).toBe('{"type":"RECORD","stream":"cars","record":{"carModel":"Audi","price":"10000","color":"blue"}}\n{"type":"RECORD","stream":"cars","record":{"carModel":"BMW","price":"15000","color":"red"}}\n')
                done();
            })
    });
    
    test('Works with Vinyl file as Buffer - empty file', (done) => {
        let fakeFile = new Vinyl({
            path:"cars.csv",
            contents: Buffer.from('')
        })
        from.obj([fakeFile]).pipe(tapCsv({columns:true}))
            .once('data', function (file: any) {
                expect(Vinyl.isVinyl(file)).toBeTruthy()
                expect(file.isBuffer()).toBeTruthy()
                expect(file.contents.toString()).toBe('')
                done();
            })
    });

    test('Works with Vinyl file as Stream', (done) => {
        let fakeFile = new Vinyl({
            path:"cars.csv",
            contents: from(['carModel,price,color\n"Audi",10000,"blue"\n"BMW",15000,"red"'])
        })
        let result: string = '';
        from.obj([fakeFile]).pipe(tapCsv({columns:true}))
            .once('data', function (file: any) {
                expect(Vinyl.isVinyl(file)).toBeTruthy()
                expect(file.isStream()).toBeTruthy()
                file.contents.on('data', function (chunk: any) {
                    result += chunk;
                })
                file.contents.on('end', function(){
                    expect(result).toBe('{"type":"RECORD","stream":"cars","record":{"carModel":"Audi","price":"10000","color":"blue"}}\n{"type":"RECORD","stream":"cars","record":{"carModel":"BMW","price":"15000","color":"red"}}\n')
                    done();
                })
            })
    });
    test('Works with Vinyl file as Stream - empty file', (done) => {
        let fakeFile = new Vinyl({
            path:"cars.csv",
            contents: from([''])
        })
        let result: string = '';
        from.obj([fakeFile]).pipe(tapCsv({columns:true}))
            .once('data', function (file: any) {
                expect(Vinyl.isVinyl(file)).toBeTruthy()
                expect(file.isStream()).toBeTruthy()
                file.contents.on('data', function (chunk: any) {
                    result += chunk;
                })
                file.contents.on('end', function(){
                    expect(result).toBe('')
                    done();
                })
            })
    });
});