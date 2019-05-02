// @ts-check
'use strict';
var colors = require('colors');

var EXPRESSIONS;
var genString;
var timestamp;
var debug = false;



/* EXAMPLE RAW GENETIC CODE
        const example_output_data = [
            ["signature", { ancestor: '2ECVyQYjd7QLoa', generation: 6, generation_offset: 2, uuid: 'ItRAwxaIkshSOU' }],
            ["config", { inputs: ["number"], outputs: ["number"] }],
            ["const", 'num_const_zc91Xi3U', [{ type: "mul", value: [{ type: "sin", value: [{ type: 'input', value: 0 }], multiplier: 1 }, { value: 0.41, multiplier: 1 }, { value: 0.5 }] }]],
            ["var", 'num_var_Nq9qdV98', [{ type: "linearFunction", value: [{ value: 0.82, multiplier: 0 }, { type: "round", value: 'num_const_zc91Xi3U' }, { type: "sin", value: [{ type: 'input', value: 0 }] }] }]],
            ["assign", 'num_var_Nq9qdV98', [{ type: "scalar", value: [{ type: "SoftPlus", value: 'num_var_Nq9qdV98', multiplier: 1 }, { type: "cos", value: 'num_const_zc91Xi3U' }] }]],
            ["return", [{ type: undefined, value: 'num_var_Nq9qdV98', multiplier: 0, inverted: -1 }]]
        ];
 */



/** Genetic line compiler
 * @param {Array} codeLineArray Input row array of gene
 * @param {number} index Row number of genetic code
 */
const compile_line = (codeLineArray, index) => {
    let output;
    let line_type = codeLineArray[0];
    switch (line_type) {
        case 'const': case 'var': case 'let': {
            let X_type = line_type;
            let X_key = codeLineArray[1];
            let formulas = [];
            codeLineArray[2].forEach(value_Array => formulas.push(compileExpression(value_Array)));
            let formula = formulas.join(' + ');
            output = `\t${X_type} ${X_key} = ${formula};`;
            break;
        }
        case 'assign':
            let X_key = codeLineArray[1];
            let formulas = [];
            codeLineArray[2].forEach(value_Array => formulas.push(compileExpression(value_Array)));
            let formula = formulas.join(' + ');
            output = `\t${X_key} = ${formula};`;
            break;
        case 'return': {
            let formulas = [];
            codeLineArray[1].forEach(value_Array => formulas.push(compileExpression(value_Array)));
            let formula = formulas.join(' , ');
            output = `\treturn [ ${formula} ];`;
            break;
        }
    }
    return output;
}


const generate_Code = abstract_code => {
    let compiled_code = [];
    abstract_code.forEach((row, i) => {
        let line = compile_line(row, i + 1);
        if (typeof line === 'string') compiled_code.push(line);
    });
    return compiled_code;
}

const compileExpression = input => {
    let inverted = input.inverted < 0 || input.inverted === true ? '*(-1)' : '';
    let output = '';
    const getLoweLayerOfData = (x, seperator) => {
        let output_string = ''
        seperator = ` ${seperator} ` || ' + ';
        if (Array.isArray(x.value)) {
            let stringArray = []
            x.value.forEach(val => stringArray.push(compileExpression(val)))
            let combined = stringArray.length > 1 ? `(${stringArray.join(' + ')})` : stringArray.join(' + ');
            output_string += ((x.multiplier | 0) > 0 || (x.multiplier | 0) < 0) ? `(${combined} * ${Math.pow(10, x.multiplier | 0)})` : combined;
        } else output_string += ((x.multiplier | 0) > 0 || (x.multiplier | 0) < 0) ? `(${x.value} * ${Math.pow(10, x.multiplier | 0)})` : x.value;
        return output_string
    }

    if ((typeof input.type === "undefined" || input.type === "default") && typeof input.value === "number")
        output += (input.value * Math.pow(10, input.multiplier | 0)) + inverted
    else if ((typeof input.type === "undefined" || input.type === "link") && typeof input.value === "string") {
        output += (((input.multiplier | 0) > 0 || (input.multiplier | 0) < 0) ? `(${input.value} * ${Math.pow(10, input.multiplier | 0)})` : input.value) + inverted;
    } else output = EXPRESSIONS[input.type].calculate(input, getLoweLayerOfData);
    return output;
}

const geneCompiler = (genetic_code, callback) => {
    let randomFilename = genString(24);
    let sim_dir = `sim_${timestamp(null, "YYYY-MM-DD")}`
    console.log(`Executing GPCG Genetic code compiler ...`)
    let inputRows = [];
    let gene_info = {};
    let gene_config = {};
    genetic_code.forEach(codeLineArray => {
        if (codeLineArray[0] === 'signature') gene_info = codeLineArray[1];
        if (codeLineArray[0] === 'config') gene_config = codeLineArray[1];
    })
    if (debug) genetic_code.forEach(row => inputRows.push(JSON.stringify(row)));
    if (debug) inputRows.forEach(row => console.log(row.black.bgWhite))
    let targetFile = `./gen/${sim_dir}/${randomFilename}.js`
    let generatedCodeLines = generate_Code(genetic_code);
    generatedCodeLines.unshift(`\targs = Array.isArray(args) ? args : [args]; // Function input is always an array`);
    generatedCodeLines.unshift(`\tlet args = JSON.parse(JSON.stringify(arg_in)) // AVOID MUTATION OF INPUT ARGUMENTS, we do not want hell to break lose`);
    generatedCodeLines.unshift(`module.exports = exports = (arg_in) => {`);
    generatedCodeLines.unshift(`const GENETIC_SOURCE_CODE = ${JSON.stringify(genetic_code)};`);   // Store GENE source code into file
    generatedCodeLines.unshift(`// GPCG - Compiled Genetic Code\n// Github: https://github.com/Jozo132/GPCG\n// Configuration: ${JSON.stringify(gene_config)}\n// Ancestor ID signature: ${gene_info.ancestor}\n// Generation ${gene_info.generation - gene_info.generation_offset}\n// Mutation ID signature: ${gene_info.uuid}\n// Timestamp: ${timestamp()}`);
    //generatedCodeLines.unshift(`const ext_sqrt = require('${BRAIN_folder}/squareRoot_inMemory')`); // Future long-term gobal function store
    generatedCodeLines.push('};')
    let generatedCode = generatedCodeLines.join('\n');
    console.log("Genetic code compiled! Code ready to be ported into a NodeJS module");
    if (debug) console.log(targetFile.black.bgYellow);
    if (debug) generatedCodeLines.forEach(row => console.log(row.black.bgWhite));
    callback(generatedCode, targetFile);
}

const setConfig = config => {
    debug = config.PARAMS.debug;
    EXPRESSIONS = config.EXPRESSIONS;
    genString = config.FUNCTIONS.genString;
    timestamp = config.FUNCTIONS.timestamp;
}

module.exports = {
    init: setConfig,
    compile: geneCompiler
}