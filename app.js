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

(() => {
    const randomConfig = {
        size: 10,
        inputs: ['number'],
        outputs: ['number']
    }
    const runCode = code => {
        for (var i = -10; i <= 10; i++)
            console.log(`function(${i}) = ${code(i)}`)
    }
    const execute = compiled_code => file.execute(compiled_code, code => runCode(code));
    const compile = genetic_code => compiler.compile(genetic_code, compiled_code => execute(compiled_code));
    const randomize = () => randomizer.generate(randomConfig, genetic_code => compile(genetic_code));
    randomize();
})()