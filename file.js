// @ts-check
'use strict';
var colors = require('colors');

const fs = require('fs');
const mkdirp = require('mkdirp');
const requireFromString = require('require-from-string');

const saveFile = (file, data, callback) => {
    console.log(`Saving file '${file}' ...`);
    mkdirp(file.substr(0, file.lastIndexOf("/")), e => {
        if (e) console.log(e);
        fs.writeFile(file, data, callback);
    })
}

const localExecution = (code, callback) => {
    //try {
    console.log("Loading module ...");
    let imported_code = requireFromString(code)  // Import generated module file
    console.log("Module loaded!");
    callback(imported_code);
    //} catch (e) { console.log(`Failed to execute: ${e}`) }
}

const storeFs_and_execute = (file, code, callback) => {
    saveFile(file, code, err => {
        if (err) return console.log(err);
        console.log("File saved!");
        localExecution(file, callback);
    });
}


module.exports = {
    execute: (code, callback) => localExecution(code, callback),
    saveAndRun: (file, code, callback) => storeFs_and_execute(file, code, callback)
}