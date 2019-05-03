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


var express = require('express');
var app = express();
var http = new (require('http').Server)(app);
var io = require('socket.io')(http);



app.get('/', function (req, res) { // Load the page on connection
    res.sendFile(__dirname + '/index.html');
});


var raw_genetic_code;
var compiled_genetic_code;
var executable_code;





var socketlist = [];
io.on('connection', function (socket) {
    socketlist.push(socket);
    var socketId = socket.id;
    var replyFrom = "Client " + socketId;
    console.log(`Cient connected: ${replyFrom}`);

    socket.on('generateNewGene', message => {
        console.log(`generateNewGene: ${message}`);

        var randomConfig = {
            size: 10,
            maxDepth: 3,
            inputs: ['number'],
            outputs: ['number']
        }

        randomizer.generate(randomConfig, random_gene => {
            raw_genetic_code = random_gene;

            compiler.compile(random_gene, (compiled_code, path) => {
                compiled_genetic_code = compiled_code;

                file.saveAndRun(compiled_code, path, code => {
                    executable_code = code;

                    socket.emit('Generated', {
                        gene: raw_genetic_code,
                        code: compiled_genetic_code
                    });
                });
            })
        });

    });

    socket.on('requestExecution', message => {
        var output = [];
        message.forEach((element, i) => {
            output[i] = {
                x: element.x,
                y: executable_code(element.x)[0]
            };
        });
        socket.emit('Executed', output);
    })

    socket.on('disconnect', () => { console.log(`Client disconnected: ${replyFrom}`); socketlist.splice(socketlist.indexOf(socket), 1); });
    //socket.on('memHistory', () => { socket.emit('memHistory_reply', mem_history) });
});


const httpServer = http.listen(8080, () => {
    console.log("HTTP server online: http://localhost:8080");
});










const test = () => {
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
}