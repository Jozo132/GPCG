// @ts-check
'use strict';

const ENGINE = require('./engine/engine');
const compiler = require('./engine/compiler')(ENGINE);
const randomizer = require('./engine/randomizer')(ENGINE);
const file = require('./engine/file');

const console_log = console.log.bind(console);
console.log = msg => console_log(`[${ENGINE.FUNCTIONS.timestamp(null, "YYYY-MM-DD HH:mm:ss.SSS")}]: `, msg);

const path = require('path');
var express = require('express');
var app = express();
var http = new (require('http').Server)(app);
var io = require('socket.io')(http);

app.use('/', express.static(path.join(__dirname, '/web')))

var raw_genetic_code;
var compiled_genetic_code;
var executable_code = function (x) { return 0; };

var socketlist = [];
io.on('connection', function (socket) {
    socketlist.push(socket);
    var socketId = socket.id;
    var replyFrom = "Client " + socketId;
    console.log(`Cient connected: ${replyFrom}`);

    socket.on('generateNewGene_1', message => {
        console.log(`generateNewGene_1: ${message}`);

        var randomConfig = {
            size: 10,
            maxDepth: 3,
            inputs: ['number'],
            outputs: ['number']
        };

        randomizer.generate(randomConfig, random_gene => {  // Generate random genetic code, based on configuration input
            raw_genetic_code = random_gene;  // Save genetic code in global variable for later

            compiler.compile(random_gene, (compiled_code, path) => {  // Compile generated genetic code
                compiled_genetic_code = compiled_code;  // Save compiled code in global variable for later

                //file.execute(compiled_code, /*path,*/ code => {  // Execute compiled genetic code
                file.saveAndExecute(compiled_code, path, code => {  // Save and execute compiled genetic code
                    executable_code = code;  // Save executable function in global variable for later

                    socket.emit('Generated_1', {  // Return genetic and compiled code for display on HTML page over Socket.IO
                        gene: raw_genetic_code,
                        code: compiled_genetic_code
                    });
                });
            });
        });

    });

    socket.on('generateNewGene_2', message => {
        console.log(`generateNewGene_2: ${message}`);

        var randomConfig = {
            size: 10,
            maxDepth: 3,
            inputs: ['number', 'number'],
            outputs: ['number']
        };

        randomizer.generate(randomConfig, random_gene => {  // Generate random genetic code, based on configuration input
            raw_genetic_code = random_gene;  // Save genetic code in global variable for later

            compiler.compile(random_gene, (compiled_code, path) => {  // Compile generated genetic code
                compiled_genetic_code = compiled_code;  // Save compiled code in global variable for later

                file.execute(compiled_code, /*path,*/ code => {  // Execute compiled genetic code
                    executable_code = code;  // Save executable function in global variable for later

                    socket.emit('Generated_2', {  // Return genetic and compiled code for display on HTML page over Socket.IO
                        gene: raw_genetic_code,
                        code: compiled_genetic_code
                    });
                });
            });
        });

    });

    socket.on('requestExecution_1', message => {
        var output = [];
        message.forEach((element, i) => {
            let executed = executable_code(element.a)
            output[i] = {
                a: element.a,
                x: executed[0]
            };
        });
        socket.emit('Plot_1', output);
        console.log(`Returned request for data execution_1`);
    });

    socket.on('requestExecution_2', message => {
        var output = [];
        message.forEach((element, i) => {
            let executed = executable_code([element.a, element.b])
            output[i] = {
                a: element.a,
                b: element.b,
                x: executed[0]
            };
        });
        socket.emit('Plot_2', output);
        console.log(`Returned request for data execution_2`);
    });

    socket.on('disconnect', () => { console.log(`Client disconnected: ${replyFrom}`); socketlist.splice(socketlist.indexOf(socket), 1); });
});


http.listen(8080, () => console.log("HTTP server online: http://localhost:8080"));








// #### MANUAL TEST ####
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
    const execute = (compiled_code, filePath) => file.saveAndExecute(compiled_code, filePath, runCode);
    const compile = genetic_code => compiler.compile(genetic_code, execute);
    const randomize = () => randomizer.generate(randomConfig, compile);
    randomize();
}