// @ts-check
'use strict';

const GLOBAL_CONFIG = require('./configuration');

const compiler = require('./compiler');
const randomizer = require('./randomizer');
compiler.init(GLOBAL_CONFIG);
randomizer.init(GLOBAL_CONFIG);

const file = require('./file');

let console_log = console.log.bind(console);
console.log = data => { console_log(`[${GLOBAL_CONFIG.FUNCTIONS.timestamp(undefined, "YYYY-MM-DD HH:mm:ss.SSS")}]: `, data); };

/*
var express = require('express');
var app = express();
var http = new (require('http').Server)(app);
var io = require('socket.io')(http);
*/

const randomConfig = {
    size: 10,
    maxDepth: 3,
    inputs: ['number'],
    outputs: ['number']
}
const runCode = code => {
    let diff = 0;
    for (var i = -10; i <= 10; i++) {
        let output = code(i)[0];
        diff = diff || 0;
        diff = output - diff;
        console.log(`function(${i}) = ${output.toFixed(4)} \t\t diff = ${diff.toFixed(4)}`)
    }
}
const execute = (compiled_code, filePath) => file.saveAndRun(compiled_code, filePath, runCode);
const compile = genetic_code => compiler.compile(genetic_code, execute);
const randomize = () => randomizer.generate(randomConfig, compile);
randomize();
