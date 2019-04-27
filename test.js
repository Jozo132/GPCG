// @ts-check
"use strict";

var colors = require('colors');
//const BRAIN_folder = `C:/brain`;  // Future long-term gobal function store
const fs = require('fs');
const mkdirp = require('mkdirp');
const requireFromString = require('require-from-string');
const moment = require('moment');
const timestamp = (input, format) => { if (input) return format ? moment(input).format(format) : moment(input).format("YYYY-MM-DD HH:mm:ss"); else return format ? moment().format(format) : moment().format("YYYY-MM-DD HH:mm:ss"); };
let console_log = console.log.bind(console);
console.log = data => { console_log(`[${timestamp(undefined, "YYYY-MM-DD HH:mm:ss.SSS")}]: `, data); };

const fe = (o, cb) => Object.keys(o).forEach((k, i) => cb(o[k], k, i))
const genString = len => { var text = ""; var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; if (len > 0) for (var i = 0; i < len; i++) text += possible.charAt(Math.floor(Math.random() * possible.length)); else for (var i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length)); return text; }




const definitions = [
    {
        type: 'input',
        group: 'input',
        parameters: {},
        calculate: (input, calback_deeper) => { // No variable or uneven parameters alowed
            return `args[${input.value}]`;
        }
    }, {
        type: 'bias__1',
        group: 'constants',
        parameters: {},
        calculate: (input, calback_deeper) => { // No variable or uneven parameters alowed
            return 1 * Math.pow(10, input.multiplier | 0);
        }
    }, {
        type: 'bias__0',
        group: 'constants',
        parameters: {},
        calculate: (input, calback_deeper) => { // No variable or uneven parameters alowed
            return 0;
        }
    }, // Will be added soon
]



const compile_formula = input => {
    let output = '';
    const getLoweLayerOfData = x => {
        let output_string = ''
        if (Array.isArray(x.value)) {
            let stringArray = []
            x.value.forEach(val => stringArray.push(compile_formula(val)))
            let combined = stringArray.length > 1 ? `(${stringArray.join(' + ')})` : stringArray.join(' + ');
            output_string += ((x.multiplier | 0) > 0 || (x.multiplier | 0) < 0) ? `(${combined} * ${Math.pow(10, x.multiplier | 0)})` : combined;
        } else
            output_string += ((x.multiplier | 0) > 0 || (x.multiplier | 0) < 0) ? `(${x.value} * ${Math.pow(10, x.multiplier | 0)})` : x.value;
        return output_string
    }

    if ((typeof input.type === "undefined" || input.type === "default") && typeof input.value === "number")
        output += input.value * Math.pow(10, input.multiplier | 0)
    else if ((typeof input.type === "undefined" || input.type === "link") && typeof input.value === "string") {
        output += ((input.multiplier | 0) > 0 || (input.multiplier | 0) < 0) ? `(${input.value} * ${Math.pow(10, input.multiplier | 0)})` : input.value;
    } else
        switch (input.type) {
            case 'input': {
                output += `args[${input.value}]`;
                break;
            }

            case 'bias__1': {
                output += 1 * Math.pow(10, input.multiplier | 0);
                break;
            }
            case 'bias__0': {
                output += 0;
                break;
            }
            case 'bias_-1': {
                output += -1 * Math.pow(10, input.multiplier | 0);
                break;
            }


            // MATH CONSTANTS with optional multiplier and sign inversion
            case 'euler': {
                output += (Math.E * Math.pow(10, input.multiplier | 0)) + inverted;
                break;
            }
            case 'pi': {
                output += (Math.PI * Math.pow(10, input.multiplier | 0)) + inverted;
                break;
            }
            case 'sqrt2': {
                output += (Math.SQRT2 * Math.pow(10, input.multiplier | 0)) + inverted;
                break;
            }
            case 'sqrt1_2': {
                output += (Math.SQRT1_2 * Math.pow(10, input.multiplier | 0)) + inverted;
                break;
            }
            case 'ln2': {
                output += (Math.LN2 * Math.pow(10, input.multiplier | 0)) + inverted;
                break;
            }
            case 'ln10': {
                output += (Math.LN10 * Math.pow(10, input.multiplier | 0)) + inverted;
                break;
            }
            case 'log2e': {
                output += (Math.LOG2E * Math.pow(10, input.multiplier | 0)) + inverted;
                break;
            }
            case 'log10e': {
                output += (Math.LOG10E * Math.pow(10, input.multiplier | 0)) + inverted;
                break;
            }


            // Numeric operations for arrays
            case 'sum': {
                let sum_stringArray = [];
                input.value.forEach(val => sum_stringArray.push(compile_formula(val)))
                output += `(${sum_stringArray.join(' + ')})`;
                break;
            }
            case 'sub': {
                let sub_stringArray = [];
                input.value.forEach(val => sub_stringArray.push(compile_formula(val)))
                output += `(${sub_stringArray.join(' - ')})`;
                break;
            }
            case 'mul': {
                let mul_stringArray = [];
                input.value.forEach(val => mul_stringArray.push(compile_formula(val)))
                output += `(${mul_stringArray.join(' * ')})`;
                break;
            }
            case 'div': {
                let div_stringArray = [];
                input.value.forEach(val => div_stringArray.push(compile_formula(val)))
                output += `(${div_stringArray.join(' / ')})`;
                break;
            }



            // MATH FUNCTIONS with sign inversion
            case 'abs': {
                output += `Math.abs(${getLoweLayerOfData(input)})` + inverted
                break;
            }
            case 'acos': {
                output += `(Math.acos(${getLoweLayerOfData(input)}) * 180.0 / Math.PI)` + inverted
                break;
            }
            case 'asin': {
                output += `(Math.asin(${getLoweLayerOfData(input)}) * 180.0 / Math.PI)` + inverted
                break;
            }
            case 'atan': {
                output += `(Math.atan(${getLoweLayerOfData(input)}) * 180.0 / Math.PI)` + inverted
                break;
            }
            case 'atan2': {
                let y = compile_formula(input.value[0] || 1)
                let x = compile_formula(input.value[1] || 1)
                output += `(Math.atan2(${y}, ${x}) * 180.0 / Math.PI)` + inverted
                break;
            }
            case 'ceil': {
                output += `Math.ceil(${getLoweLayerOfData(input)})` + inverted
                break;
            }
            case 'cos': {
                output += `Math.cos(${getLoweLayerOfData(input)} * Math.PI / 180.0)` + inverted
                break;
            }
            case 'exp': {
                output += `Math.exp(${getLoweLayerOfData(input)})` + inverted
                break;
            }
            case 'floor': {
                output += `Math.floor(${getLoweLayerOfData(input)})` + inverted
                break;
            }
            case 'log': {
                output += `Math.log(${getLoweLayerOfData(input)})` + inverted
                break;
            }
            case 'max': {
                output += `Math.max(${getLoweLayerOfData(input, ',')})` + inverted
                break;
            }
            case 'min': {
                output += `Math.min(${getLoweLayerOfData(input, ',')})` + inverted
                break;
            }
            case 'pow': {
                let a = compile_formula(input.value[0] || 1)
                let b = compile_formula(input.value[1] || 1)
                output += `Math.pow(${a}, ${b})` + inverted
                break;
            }
            case 'round': {
                output += `Math.round(${getLoweLayerOfData(input)})` + inverted
                break;
            }
            case 'sin': {
                output += `Math.sin(${getLoweLayerOfData(input)} * Math.PI / 180.0)` + inverted
                break;
            }
            case 'sqrt': {
                output += `Math.sqrt(${getLoweLayerOfData(input)})` + inverted
                break;
            }
            case 'tan': {
                output += `Math.tan(${getLoweLayerOfData(input)} * Math.PI / 180.0)` + inverted
                break;
            }
            case 'rad': {
                output += `(${getLoweLayerOfData(input)} * Math.PI / 180.0)` + inverted
                break;
            }
            case 'deg': {
                output += `(${getLoweLayerOfData(input)} * 180.0 / Math.PI)` + inverted
                break;
            }


            case 'linearFunction': {
                let k = compile_formula(input.value[0] || 1)
                let x = compile_formula(input.value[1] || 1)
                let n = compile_formula(input.value[2] || 0)
                output = `(${k} * ${x.charAt(0) === '-' ? `(${x})` : x} ${n === '0' || n.length === 0 ? '' : (n.charAt(0) === '-' ? `- ${n.substr(1)}` : `+ ${n}`)})`
                break;
            }


            case 'Step': {
                output += `(${getLoweLayerOfData(input)} >= 0 ? 1 : 0)`;
                break;
            }
            case 'ReLU': {
                output += `(${getLoweLayerOfData(input)} > 0 ? ${getLoweLayerOfData(input)} : 0)`;
                break;
            }
            case 'PReLU': {
                output += `(${getLoweLayerOfData(input)} > 0 ? ${getLoweLayerOfData(input)} : 0.01 * ${getLoweLayerOfData(input)})`;
                break;
            }
            case 'Sigmoid': {
                output += `(1 / (1 + Math.exp(-1 * ${getLoweLayerOfData(input)})))`;
                break;
            }
            case 'Tanh': {
                output += `(2 / (1 + Math.exp(-2 * ${getLoweLayerOfData(input)})) - 1)`;
                break;
            }
            case 'ArcTan': {
                output += `Math.atan(${getLoweLayerOfData(input)})`
                break;
            }
            case 'SoftPlus': {
                output += `Math.log(1 + Math.exp(${getLoweLayerOfData(input)}))`;
                break;
            }
        }
    return output;
}


const compile_line = (codeLineArray, index) => {
    /** @type {string}   */
    let output = ``;
    let line_type = codeLineArray[0];
    switch (line_type) {
        case 'return': {
            let formulas = [];
            codeLineArray[1].forEach((value_Array) => {
                formulas.push(compile_formula(value_Array));
            });
            let formula = formulas.join(' + ');
            output = `\treturn ${formula};`;
            break;
        }
        case 'const': case 'var': case 'let': {
            let X_type = line_type;
            let X_key = codeLineArray[1];
            let formulas = [];
            codeLineArray[2].forEach((value_Array) => {
                formulas.push(compile_formula(value_Array));
            });
            let formula = formulas.join(' + ');

            output = `\t${X_type} ${X_key} = ${formula};`;
            break;
        }
    }
    return output;
}


const generate_Code = abstract_code => {
    let compiled_code = [];
    abstract_code.forEach((row, i) => {
        compiled_code.push(compile_line(row, i + 1));
    });
    return compiled_code;
}



let example_output_data = [
    ["const", 'num_zc91Xi3U', [{ type: "div", value: [{ type: "PReLU", value: [{ type: 'input', value: 0 }], multiplier: 1 }, { value: 0.41, multiplier: 1 }, { value: 0.5 }] }]],
    ["var", 'num_Nq9qdV98', [{ type: "linearFunction", value: [{ value: 0.82, multiplier: 3 }, { type: "Tanh", value: 'num_zc91Xi3U' }] }]],
    ["return", [{ value: 'num_Nq9qdV98', multiplier: -1 }]]
    //["return", [{ value: 'ext_sqrt(16)' }]]   // Future long-term gobal function store
];


const saveFile = (file, data, callback) => {
    console.log(`Saving file '${file}' ...`);
    mkdirp(file.substr(0, file.lastIndexOf("/")), e => {
        if (e) console.log(e);
        fs.writeFile(file, data, callback);
    })
}


const localExecution = (code, callback) => {
    console.log("Local execution, not saving code.");
    try {
        let imported_code = requireFromString(code)  // Import generated module file
        callback(imported_code);
    } catch (e) {
        console.log(`Failed to execute `, e)
    }
}

const storeFs_and_execute = (file, code, callback) => {
    saveFile(file, code, err => {
        if (err) return console.log(err);
        console.log("Saved! Now loading and returning the module");
        try {
            let imported_code = require(file)  // Import generated module file
            callback(imported_code)
        } catch (e) {
            console.log(`Failed to execute '${file}' `, e)
        }
    });
}


const test = () => {
    let randomFilename = genString(24);
    let sim_dir = `sim_${timestamp(null, "YYYY-MM-DD")}`
    console.log("########### Starting test ###########\n");
    console.log(`Executing Gene compiler with the following data:`)
    let inputRows = [];
    example_output_data.forEach((row, i) => inputRows.push(JSON.stringify(row) + (i == example_output_data.length - 1 ? '\n' : '')));
    inputRows.forEach(row => console.log(row.black.bgWhite))

    let targetFile = `./gen/${sim_dir}/${randomFilename}.js`
    let generatedCodeLines = generate_Code(example_output_data);

    generatedCodeLines.unshift(`\tconst args = Array.isArray(arg_in) ? arg_in : [arg_in]; // Function input is always an array`);
    generatedCodeLines.unshift(`module.exports = exports = (arg_in) => {`);
    //generatedCodeLines.unshift(`const ext_sqrt = require('${BRAIN_folder}/squareRoot_inMemory')`); // Future long-term gobal function store
    generatedCodeLines.push('};\n')
    let generatedCode = generatedCodeLines.join('\n');

    console.log("Gene compiled! Code ready to be ported into a NodeJS module");
    console.log(targetFile.black.bgYellow);
    generatedCodeLines.forEach(row => console.log(row.black.bgWhite));

    let last = 0;
    localExecution(generatedCode, code => {
        for (var i = -5; i <= 5; i += 0.5) {
            let args = [i.toFixed(1)];
            let returned = code(args);
            let delta = returned - last;
            last = returned;
            console.log(`code(${args}) => ${returned.toFixed(4)}\tdelta ${delta.toFixed(4)}`)
        }
    });

    /*
    storeFs_and_execute(targetFile, generatedCode, code => {
        for (var i = -5; i < 6; i += 0.5) {
            let args = [i.toFixed(1)];
            let returned = code(args).toFixed(4);
            let delta = returned - last;
            last = returned;
            console.log(`code(${args}) => ${returned}\tdelta ${delta}`)
        }
    });
    */
}

setTimeout(test, 1000);

