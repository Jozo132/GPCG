// @ts-check
'use strict';

const GLOBAL_CONFIG = require('./configuration');
const compiler = require('./compiler')(GLOBAL_CONFIG);
const randomizer = require('./randomizer')(GLOBAL_CONFIG);

const file = require('./file');

const console_log = console.log.bind(console);
console.log = msg => console_log(`[${GLOBAL_CONFIG.FUNCTIONS.timestamp(null, "YYYY-MM-DD HH:mm:ss.SSS")}]: `, msg);


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
        };

        randomizer.generate(randomConfig, random_gene => {  // Generate random genetic code, based on configuration input
            raw_genetic_code = random_gene;  // Save genetic code in global variable for later

            compiler.compile(random_gene, (compiled_code, path) => {  // Compile generated genetic code
                compiled_genetic_code = compiled_code;  // Save compiled code in global variable for later

                file.saveAndRun(compiled_code, path, code => {  // Save and execute compiled genetic code
                    executable_code = code;  // Save executable function in global variable for later

                    socket.emit('Generated', {  // Return genetic and compiled code for display on HTML page over Socket.IO
                        gene: raw_genetic_code,
                        code: compiled_genetic_code
                    });
                });
            });
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
    });

    socket.on('disconnect', () => { console.log(`Client disconnected: ${replyFrom}`); socketlist.splice(socketlist.indexOf(socket), 1); });
});


http.listen(8080, () => console.log("HTTP server online: http://localhost:8080"));








/*// #### MANUAL TEST ####

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

//*///