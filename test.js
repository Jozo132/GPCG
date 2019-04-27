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


const isInverted = is => is < 0 || is === true ? '*(-1)' : '';

const operators = [
    /*{
        type: 'input',
        group: 'input',
        cost: 1,
        parameters: {},
        calculate: (input, calback_deeper) => { // No variable or uneven parameters alowed
            return `args[${input.value | 0}]`;
        }
    },*/
    {
        type: 'default',
        group: 'analog',
        cost: 1,
        upgradable: true,
        parameters: {},
        calculate: (input, calback_deeper) => {
            return input.value * Math.pow(10, input.multiplier | 0);
        },
        random: () => {
            return {
                type: 'default',
                value: Math.random(),
                multiplier: Math.round(Math.random() * 4) - 2,
                inverted: Math.random() > 0.5
            }
        }
    }, {
        type: 'bias__1',
        group: 'constants',
        cost: 1,
        parameters: {},
        calculate: (input, calback_deeper) => {
            return 1 * Math.pow(10, input.multiplier | 0);
        },
        random: () => {
            return {
                type: 'bias__1',
                value: 1,
                multiplier: Math.round(Math.random() * 4) - 2,
                inverted: false
            }
        }
    }, {
        type: 'bias__0',
        group: 'constants',
        cost: 1,
        parameters: {},
        calculate: (input, calback_deeper) => {
            return 0;
        },
        random: () => {
            return {
                type: 'bias__0',
                value: 0,
                multiplier: 0,
                inverted: false
            }
        }
    }, {
        type: 'bias_-1',
        group: 'constants',
        cost: 1,
        parameters: {},
        calculate: (input, calback_deeper) => {
            return -1 * Math.pow(10, input.multiplier | 0);
        },
        random: () => {
            return {
                type: 'bias_-1',
                value: -1,
                multiplier: Math.round(Math.random() * 4) - 2,
                inverted: false
            }
        }
    }, {
        type: 'linearFunction',
        group: 'linearAlgebra',
        cost: 3,
        parameters: {},
        calculate: (input, calback_deeper) => {
            let k = calback_deeper(input.value[0] || 1)
            let x = calback_deeper(input.value[1] || 1)
            let n = calback_deeper(input.value[2] || 0)
            return `(${k} * ${x.charAt(0) === '-' ? `(${x})` : x} ${n === '0' || n.length === 0 ? '' : (n.charAt(0) === '-' ? `- ${n.substr(1)}` : `+ ${n}`)})` + isInverted(input.inverted)
        },
        random: () => { // NEED TO ADD RANDOM SELECTION OF CHEAP NUMBERS
            return {
                type: 'linearFunction',
                value: [{
                    type: 'default',
                    value: 1,
                    multiplier: Math.round(Math.random() * 4) - 2,
                    inverted: Math.random() > 0.5
                }, {
                    type: 'default',
                    value: 1,
                    multiplier: Math.round(Math.random() * 4) - 2,
                    inverted: Math.random() > 0.5
                }, {
                    type: 'default',
                    value: 1,
                    multiplier: Math.round(Math.random() * 4) - 2,
                    inverted: Math.random() > 0.5
                }],
                multiplier: Math.round(Math.random() * 4) - 2,
                inverted: Math.random() > 0.5
            }
        }
    }
]

const declarations = [
    {
        name: "const",
        identifier: "num_const_",
        type: "variable",
        cost: 1,
        scope: "local",
        modify: false
    },
    {
        name: "var",
        identifier: "num_var_",
        cost: 1,
        type: "variable",
        scope: "local",
        modify: true
    },
    {
        name: "assign",
        cost: 1,
        type: "variable",
        scope: "local",
        modify: false
    }
]




const ramdomizeGene = money => {
    const ancestorId = genString(16);
    var random_code = [];
    random_code.push(["signature", { ancestor: ancestorId, generation: 1, generation_offset: 0, uuid: ancestorId }])
    if (typeof money !== 'number') money = 10;
    let return_price = Math.round(Math.random() * 3);


    var declaredVariables = [];


    for (var remaining_money = money - return_price, done_buying = false; remaining_money > 0 && !done_buying;) {
        var row = [];
        var selected = {};

        if (declaredVariables.length > 0) { // If variables already exist, use option to modify them
            let options = ["const", "var", "assign"];
            let x = options[Math.round(Math.random() * 2)];
            declarations.forEach(decl => { if (decl.name === x) selected = JSON.parse(JSON.stringify(decl)); });
        } else {
            let options = ["const", "var"];
            let x = options[Math.round(Math.random())];
            declarations.forEach(decl => { if (decl.name === x) selected = JSON.parse(JSON.stringify(decl)); });
        }

        remaining_money -= selected.cost;


        let availableOperations = [];
        operators.forEach(op => {
            if (op.cost <= remaining_money) availableOperations.push({ type: op.type, group: op.group, cost: op.cost })
        })

        let operation = operators[Math.round(Math.random() * (operators.length - 1))]

        // TO DO: randomly nested stuff

        let id = selected.identifier + genString(8);

        row = [selected.name, id]
        // ["const", 'num_const_ABC', [{ type: "default", value: { value: 0.5 }]]
        random_code.push(row);

        if (Math.random() > 0.9) done_buying = true;
    }
}




const compile_formula = input => {
    let inverted = input.inverted < 0 || input.inverted === true ? '*(-1)' : '';
    let output = '';
    const getLoweLayerOfData = (x, seperator) => {
        let output_string = ''
        seperator = ` ${seperator} ` || ' + ';
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
        output += (input.value * Math.pow(10, input.multiplier | 0)) + inverted
    else if ((typeof input.type === "undefined" || input.type === "link") && typeof input.value === "string") {
        output += (((input.multiplier | 0) > 0 || (input.multiplier | 0) < 0) ? `(${input.value} * ${Math.pow(10, input.multiplier | 0)})` : input.value) + inverted;
    } else
        switch (input.type) {
            // INPUT CONSTANTS
            case 'input': {
                output += `args[${input.value}]`;
                break;
            }

            // BIAS CONSTANTS with optional multiplier
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
                output = `(${k} * ${x.charAt(0) === '-' ? `(${x})` : x} ${n === '0' || n.length === 0 ? '' : (n.charAt(0) === '-' ? `- ${n.substr(1)}` : `+ ${n}`)})` + inverted
                break;
            }


            case 'Step': {
                output += `(${getLoweLayerOfData(input)} >= 0 ? 1 : 0)` + inverted;
                break;
            }
            case 'ReLU': {
                output += `(${getLoweLayerOfData(input)} > 0 ? ${getLoweLayerOfData(input)} : 0)` + inverted;
                break;
            }
            case 'Leaky ReLU': {
                output += `(${getLoweLayerOfData(input)} >= 0 ? ${getLoweLayerOfData(input)} : 0.01 * ${getLoweLayerOfData(input)})` + inverted;
                break;
            }
            case 'PReLU': {
                let x = compile_formula(input.value[0] || 0);
                let a = compile_formula(input.value[1] || 0.01);
                output += `(${x} >= 0 ? ${x} : ${a} * ${x})` + inverted;
                break;
            }
            case 'Sigmoid': {
                output += `(1 / (1 + Math.exp(-1 * ${getLoweLayerOfData(input)})))` + inverted;
                break;
            }
            case 'Tanh': {
                output += `(2 / (1 + Math.exp(-2 * ${getLoweLayerOfData(input)})) - 1)` + inverted;
                break;
            }
            case 'ArcTan': {
                output += `Math.atan(${getLoweLayerOfData(input)})`
                break;
            }
            case 'SoftPlus': {
                output += `Math.log(1 + Math.exp(${getLoweLayerOfData(input)}))` + inverted;
                break;
            }
        }
    return output;
}


const compile_line = (codeLineArray, index) => {
    /** @type {string}   */
    let output;
    let line_type = codeLineArray[0];
    switch (line_type) {
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
        case 'assign':
            let X_key = codeLineArray[1];
            let formulas = [];
            codeLineArray[2].forEach((value_Array) => {
                formulas.push(compile_formula(value_Array));
            });
            let formula = formulas.join(' + ');
            output = `\t${X_key} = ${formula};`;
            break;
        case 'return': {
            let formulas = [];
            codeLineArray[1].forEach((value_Array) => {
                formulas.push(compile_formula(value_Array));
            });
            let formula = formulas.join(' + ');
            output = `\treturn ${formula};`;
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



const example_output_data = [
    ["signature", { ancestor: '2ECVyQYjd7QLoa', generation: 6, generation_offset: 2, uuid: 'ItRAwxaIkshSOU' }],
    ["const", 'num_const_zc91Xi3U', [{ type: "mul", value: [{ type: "sin", value: [{ type: 'input', value: 0 }], multiplier: 1 }, { value: 0.41, multiplier: 1 }, { value: 0.5 }] }]],
    ["var", 'num_var_Nq9qdV98', [{ type: "linearFunction", value: [{ value: 0.82, multiplier: 0 }, { type: "round", value: 'num_const_zc91Xi3U' }, { type: "sin", value: [{ type: 'input', value: 0 }] }] }]],
    ["assign", 'num_var_Nq9qdV98', [{ type: "PReLU", value: [{ type: "SoftPlus", value: 'num_var_Nq9qdV98', multiplier: 1 }, { type: "cos", value: 'num_const_zc91Xi3U' }] }]],
    ["return", [{ type: undefined, value: 'num_var_Nq9qdV98', multiplier: 0, inverted: -1 }]]
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
    console.log(`Executing EXAMPLE Gene compiler with the following data:`)
    let inputRows = [];
    let gene_info = {};
    example_output_data.forEach(codeLineArray => { if (codeLineArray[0] === 'signature') gene_info = codeLineArray[1] })
    example_output_data.forEach(row => inputRows.push(JSON.stringify(row)));
    inputRows.forEach(row => console.log(row.black.bgWhite))

    let targetFile = `./gen/${sim_dir}/${randomFilename}.js`
    let generatedCodeLines = generate_Code(example_output_data);

    generatedCodeLines.unshift(`\targs = Array.isArray(args) ? args : [args]; // Function input is always an array`);
    generatedCodeLines.unshift(`\tlet args = JSON.parse(JSON.stringify(arg_in)) // AVOID MUTATION OF INPUT ARGUMENTS, we do not want hell to break lose`);

    generatedCodeLines.unshift(`module.exports = exports = (arg_in) => {`);
    //generatedCodeLines.unshift(`let SOURCE = ${JSON.stringify(example_output_data)};`);   // Store GENE source code into file
    generatedCodeLines.unshift(`// ${gene_info.ancestor}_generation_${gene_info.generation - gene_info.generation_offset}_${gene_info.uuid}  ${timestamp()}`);
    //generatedCodeLines.unshift(`const ext_sqrt = require('${BRAIN_folder}/squareRoot_inMemory')`); // Future long-term gobal function store
    generatedCodeLines.push('};')

    let generatedCode = generatedCodeLines.join('\n');

    console.log("Gene compiled! Code ready to be ported into a NodeJS module");
    console.log(targetFile.black.bgYellow);
    generatedCodeLines.forEach(row => {
        console.log(row.black.bgWhite)
    });

    let last = 0;

    const execute = code => {
        for (var i = -6; i <= 25; i += 1) {
            let args = [i.toFixed(1)];
            let returned = code(args);
            let delta = returned - last;
            last = returned;
            console.log(`code(${args})  =>  ${returned.toFixed(4)}\tdelta ${delta.toFixed(4)}`)
        }
    }

    // Just execute the code
    //localExecution(generatedCode, execute);

    // Store generated code locally and execute
    storeFs_and_execute(targetFile, generatedCode, execute);

}

setTimeout(test, 1000);

