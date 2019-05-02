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

const saveFile = (file, data, callback) => {
    console.log(`Saving file '${file}' ...`);
    mkdirp(file.substr(0, file.lastIndexOf("/")), e => {
        if (e) console.log(e);
        fs.writeFile(file, data, callback);
    })
}


const localExecution = (code, callback) => {
    console.log("Local execution, not saving code.");
    //try {
    let imported_code = requireFromString(code)  // Import generated module file
    callback(imported_code);
    //} catch (e) { console.log(`Failed to execute: ${e}`) }
}

const storeFs_and_execute = (file, code, callback) => {
    saveFile(file, code, err => {
        if (err) return console.log(err);
        console.log("Saved! Now loading and returning the module");
        //try {
        let imported_code = require(file)  // Import generated module file
        callback(imported_code)
        //} catch (e) { console.log(`Failed to execute '${file}': ${e}`) }
    });
}


/** Generate random hash-like string for UUID
 * @param {number} length 
 * @returns {String} output
 * @example
 *  genString(6); // Output "g7ncNQ"
 */
const genString = length => { var output = ""; var possibilities = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; if (length > 0) for (var i = 0; i < length; i++) output += possibilities.charAt(Math.floor(Math.random() * possibilities.length)); else for (var i = 0; i < 8; i++) output += possibilities.charAt(Math.floor(Math.random() * possibilities.length)); return output; }


/** Constrain an input to a custom limited range
 * @param {number} input 
 * @param {number} min 
 * @param {number} max
 * @example
 *  constrain(100, 0, 10); // Output: 10
 *  constrain(100, 9, 1);  // Output: 9
 */
const constrain = (input, min, max) => input < Math.min(max, min) ? Math.min(max, min) : input > Math.max(max, min) ? Math.max(max, min) : input;


/** Scale an input to a different range
 * @param {number} value
 * @param {number} start1
 * @param {number} stop1
 * @param {number} start2
 * @param {number} stop2
 * @example
 *  scale(512, 0, 1024, -15, 35); // Output 10
 */
const scale = (value, start1, stop1, start2, stop2) => start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1))



/** Randomly select a number between min and max where a higher number is rarer to be selected
 * @param {number} min 
 * @param {number} max 
 */
const random_lowChance = (min, max) => { const lo = x => (2 * x - 1), qo = x => Math.pow(10 * x - 5, 2) / 25; let r = Math.random, x = r() * (r() > 0.5 ? 1 : 0.8) * (r() > 0.5 ? 1 : 0.8); return Math.round((x > 0.5) ? qo(x) * (max - min) + min : min); };


/** Randomly select a number between min and max
 * @param {number} min 
 * @param {number} max 
 */
const random_chance = (min, max) => Math.round(Math.random() * ((max - min))) + min;
const random_item = array => array[random_chance(0, array.length - 1)]

//const isInverted = is => is < 0 || is === true ? '*(-1)' : '';
const isInverted = is => is < 0 || is === true ? -1 : 1;


/*
            case 'Step': {
                output += `(${getLoweLayerOfData(input)} >= 0.0 ? 1.0 : 0.0)` + inverted;
                break;
            }
            case 'ReLU': {
                output += `(${getLoweLayerOfData(input)} > 0.0 ? ${getLoweLayerOfData(input)} : 0.0)` + inverted;
                break;
            }
            case 'Leaky ReLU': {
                output += `(${getLoweLayerOfData(input)} >= 0.0 ? ${getLoweLayerOfData(input)} : 0.01 * ${getLoweLayerOfData(input)})` + inverted;
                break;
            }
            case 'PReLU': {
                let x = compile_formula(input.value[0] || 0);
                let a = compile_formula(input.value[1] || 0.01);
                output += `(${x} >= 0.0 ? ${x} : ${a} * ${x})` + inverted;
                break;
            }
            case 'Sigmoid': {
                output += `(1.0 / (1.0 + Math.exp(-1.0 * ${getLoweLayerOfData(input)})))` + inverted;
                break;
            }
            case 'Tanh': {
                output += `(2.0 / (1.0 + Math.exp(-2.0 * ${getLoweLayerOfData(input)})) - 1.0)` + inverted;
                break;
            }
            case 'ArcTan': {
                output += `Math.atan(${getLoweLayerOfData(input)})`
                break;
            }
            case 'SoftPlus': {
                output += `Math.log(1.0 + Math.exp(${getLoweLayerOfData(input)}))` + inverted;
                break;
            }
*/


const EXPRESSIONS = {
    'default': {
        group: 'constant',
        parameters: {
            useAsBase: false,
            chanceToUse: 0.75,
            complexity: 1,
            inputsMin: 0,
            inputsMax: 0
        },
        calculate: (input, calback_deeper) => {
            return input.value * Math.pow(10, input.multiplier | 0);
        },
        random: (variables, requestExpression) => {
            return {
                type: 'default',
                value: Math.random(),
                multiplier: random_chance(-1, 1),
                inverted: Math.random() > 0.5 ? true : false
            }
        }
    },
    'link': {
        group: 'variable',
        parameters: {
            useAsBase: false,
            chanceToUse: 1.00,
            complexity: 0.1,
            inputsMin: 0,
            inputsMax: 0
        },
        calculate: (input, calback_deeper) => {
            return input.value * Math.pow(10, input.multiplier | 0);
        },
        random: (variables, requestExpression) => {
            let output = {
                type: 'link',
                value: random_item(variables),
                multiplier: 0,
                inverted: false
            }
            return output;
        }
    },
    'bias 1': {
        group: 'constant',
        parameters: {
            useAsBase: false,
            chanceToUse: 0.50,
            complexity: 0.1,
            inputsMin: 0,
            inputsMax: 0
        },
        calculate: (input, calback_deeper) => {
            return 1 * Math.pow(10, input.multiplier | 0);
        },
        random: (variables, requestExpression) => {
            return {
                type: 'bias 1',
                value: 1,
                multiplier: random_chance(-1, 1),
                inverted: Math.random() > 0.5 ? true : false
            }
        }
    },
    'euler': {
        group: 'constant',
        parameters: {
            useAsBase: false,
            chanceToUse: 0.10,
            complexity: 1,
            inputsMin: 0,
            inputsMax: 0
        },
        calculate: (input, calback_deeper) => {
            let multiplier = Math.pow(10, input.multiplier | 0) * isInverted(input.inverted)
            return `Math.E${multiplier !== 0 ? ` * ${multiplier}` : ''}`;
        },
        random: (variables, requestExpression) => {
            return {
                type: 'euler',
                value: 'Math.E',
                multiplier: 0,
                inverted: false
            }
        }
    },
    'pi': {
        group: 'constant',
        parameters: {
            useAsBase: false,
            chanceToUse: 0.10,
            complexity: 1,
            inputsMin: 0,
            inputsMax: 0
        },
        calculate: (input, calback_deeper) => {
            let multiplier = Math.pow(10, input.multiplier | 0) * isInverted(input.inverted)
            return `Math.PI${multiplier !== 0 ? ` * ${multiplier}` : ''}`;
        },
        random: (variables, requestExpression) => {
            return {
                type: 'pi',
                value: 'Math.PI',
                multiplier: 0,
                inverted: false
            }
        }
    },
    'sqrt2': {
        group: 'constant',
        parameters: {
            useAsBase: false,
            chanceToUse: 0.10,
            complexity: 1,
            inputsMin: 0,
            inputsMax: 0
        },
        calculate: (input, calback_deeper) => {
            let multiplier = Math.pow(10, input.multiplier | 0) * isInverted(input.inverted)
            return `Math.SQRT2${multiplier !== 0 ? ` * ${multiplier}` : ''}`;
        },
        random: (variables, requestExpression) => {
            return {
                type: 'sqrt2',
                value: 'Math.SQRT2',
                multiplier: 0,
                inverted: false
            }
        }
    },
    'sqrt1_2': {
        group: 'constant',
        parameters: {
            useAsBase: false,
            chanceToUse: 0.10,
            complexity: 1,
            inputsMin: 0,
            inputsMax: 0
        },
        calculate: (input, calback_deeper) => {
            let multiplier = Math.pow(10, input.multiplier | 0) * isInverted(input.inverted)
            return `Math.SQRT1_2${multiplier !== 0 ? ` * ${multiplier}` : ''}`;
        },
        random: (variables, requestExpression) => {
            return {
                type: 'sqrt1_2',
                value: 'Math.SQRT1_2',
                multiplier: 0,
                inverted: false
            }
        }
    },
    'ln2': {
        group: 'constant',
        parameters: {
            useAsBase: false,
            chanceToUse: 0.10,
            complexity: 1,
            inputsMin: 0,
            inputsMax: 0
        },
        calculate: (input, calback_deeper) => {
            let multiplier = Math.pow(10, input.multiplier | 0) * isInverted(input.inverted)
            return `Math.LN2${multiplier !== 0 ? ` * ${multiplier}` : ''}`;
        },
        random: (variables, requestExpression) => {
            return {
                type: 'ln2',
                value: 'Math.LN2',
                multiplier: 0,
                inverted: false
            }
        }
    },
    'ln10': {
        group: 'constant',
        parameters: {
            useAsBase: false,
            chanceToUse: 0.10,
            complexity: 1,
            inputsMin: 0,
            inputsMax: 0
        },
        calculate: (input, calback_deeper) => {
            let multiplier = Math.pow(10, input.multiplier | 0) * isInverted(input.inverted)
            return `Math.LN10${multiplier !== 0 ? ` * ${multiplier}` : ''}`;
        },
        random: (variables, requestExpression) => {
            return {
                type: 'ln10',
                value: 'Math.LN10',
                multiplier: 0,
                inverted: false
            }
        }
    },
    'log2e': {
        group: 'constant',
        parameters: {
            useAsBase: false,
            chanceToUse: 0.10,
            complexity: 1,
            inputsMin: 0,
            inputsMax: 0
        },
        calculate: (input, calback_deeper) => {
            let multiplier = Math.pow(10, input.multiplier | 0) * isInverted(input.inverted)
            return `Math.LOG2E${multiplier !== 0 ? ` * ${multiplier}` : ''}`;
        },
        random: (variables, requestExpression) => {
            return {
                type: 'log2e',
                value: 'Math.LOG2E',
                multiplier: 0,
                inverted: false
            }
        }
    },
    'log10e': {
        group: 'constant',
        parameters: {
            useAsBase: false,
            chanceToUse: 0.10,
            complexity: 1,
            inputsMin: 0,
            inputsMax: 0
        },
        calculate: (input, calback_deeper) => {
            let multiplier = Math.pow(10, input.multiplier | 0) * isInverted(input.inverted)
            return `Math.LOG10E${multiplier !== 0 ? ` * ${multiplier}` : ''}`;
        },
        random: (variables, requestExpression) => {
            return {
                type: 'log10e',
                value: 'Math.LOG10E',
                multiplier: 0,
                inverted: false
            }
        }
    },
    'sum': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.50,
            complexity: 0.1,
            inputsMin: 2,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(calback_deeper(val)))
            return `(${stringArray.join(' + ')})`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(2, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'sum',
                value: inputs
            }
        }
    },
    'avg': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.25,
            complexity: 0.1,
            inputsMin: 2,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(calback_deeper(val)))
            return `(${stringArray.join(' + ')})/${stringArray.length.toFixed(1)}`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(2, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'avg',
                value: inputs
            }
        }
    },
    'sub': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.20,
            complexity: 0.5,
            inputsMin: 2,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(calback_deeper(val)))
            return `(${stringArray.join(' - ')})`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(2, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'sub',
                value: inputs
            }
        }
    },
    'mul': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.30,
            complexity: 0.5,
            inputsMin: 2,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => {
                let x = calback_deeper(val)
                if (!(x === '1' || x === 1)) stringArray.push(x)
            })
            return `(${stringArray.join(' * ')})`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(2, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'mul',
                value: inputs
            }
        }
    },
    'div': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.001,
            complexity: 5.0,
            inputsMin: 2,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(calback_deeper(val)))
            return `(${stringArray.join(' / ')})`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(2, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'div',
                value: inputs
            }
        }
    },
    'scalar': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 4,
            inputsMin: 2,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`Math.pow(${calback_deeper(val)}, 2.0)`))
            return `Math.sqrt(${stringArray.join(' + ')})`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(2, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'scalar',
                value: inputs
            }
        }
    },
    'linearFunction': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.20,
            complexity: 5,
            inputsMin: 2,
            inputsMax: 3
        },
        calculate: (input, calback_deeper) => {
            let k = calback_deeper(input.value[0] || 1)
            let x = calback_deeper(input.value[1] || 1)
            let n = input.value[2] ? calback_deeper(input.value[2] || 0) : '0'
            return `(${k === 1 || k === '1' ? '' : `${k} * `}${x.charAt(0) === '-' ? `(${x})` : x} ${n === '0' || n.length === 0 ? '' : (n.charAt(0) === '-' ? `- ${n.substr(1)}` : `+ ${n}`)})`
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(2, 3);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'linearFunction',
                value: inputs
            }
        }
    },
    'sq': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 1,
            inputsMax: 3
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`Math.pow(${calback_deeper(val)}, 2.0)`))
            return stringArray.length > 1 ? `(${stringArray.join(' + ')})` : stringArray[0];
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 3);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'sq',
                value: inputs
            }
        }
    },
    'abs': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 2,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `Math.abs(${stringArray.join(' + ')})`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(2, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'abs',
                value: inputs
            }
        }
    },
    'acos': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `(Math.acos(${stringArray.join(' + ')}) * 180.0 / Math.PI)`; // (Math.acos(${getLoweLayerOfData(input)}) * 180.0 / Math.PI)
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'acos',
                value: inputs
            }
        }
    },
    'asin': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `(Math.asin(${stringArray.join(' + ')}) * 180.0 / Math.PI)`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'asin',
                value: inputs
            }
        }
    },
    'atan': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `(Math.atan(${stringArray.join(' + ')}) * 180.0 / Math.PI)`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(2, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'atan',
                value: inputs
            }
        }
    },
    'atan2': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 10,
            inputsMin: 2,
            inputsMax: 2
        },
        calculate: (input, calback_deeper) => {
            /** 
             * 
                let y = compile_formula(input.value[0] || 1)
                let x = compile_formula(input.value[1] || 1)
                output += `(Math.atan2(${y}, ${x}) * 180.0 / Math.PI)` + inverted
            */
            let y = calback_deeper(input.value[0] || 1)
            let x = calback_deeper(input.value[1] || 1)
            return `(Math.atan2(${y}, ${x}) * 180.0 / Math.PI)`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = 2;
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'atan2',
                value: inputs
            }
        }
    },
    'ceil': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 2,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `Math.ceil(${stringArray.join(' + ')})`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'ceil',
                value: inputs
            }
        }
    },
    'cos': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `Math.cos(${stringArray.join(' + ')} * Math.PI / 180.0)`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'cos',
                value: inputs
            }
        }
    },
    'exp': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `Math.exp(${stringArray.join(' + ')})`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'exp',
                value: inputs
            }
        }
    },
    'floor': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `Math.floor(${stringArray.join(' + ')})`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'floor',
                value: inputs
            }
        }
    },
    'log': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `Math.log(${stringArray.join(' + ')})`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'log',
                value: inputs
            }
        }
    },
    'max': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 2,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `Math.max( ${stringArray.join(' , ')} )`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(2, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'max',
                value: inputs
            }
        }
    },
    'min': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 2,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `Math.min( ${stringArray.join(' , ')} )`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(2, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'min',
                value: inputs
            }
        }
    },
    'pow': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 2,
            inputsMax: 2
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `Math.pow(${stringArray.join(' , ')})`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = 2;
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'pow',
                value: inputs
            }
        }
    },
    'round': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `Math.round(${stringArray.join(' + ')})`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'round',
                value: inputs
            }
        }
    },
    'sin': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `Math.sin(${stringArray.join(' + ')} * Math.PI / 180.0)`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'sin',
                value: inputs
            }
        }
    },
    'sqrt': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 8,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `Math.sqrt(${stringArray.join(' + ')})`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'sqrt',
                value: inputs
            }
        }
    },
    'tan': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `Math.tan(${stringArray.join(' + ')} * Math.PI / 180.0)`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'tan',
                value: inputs
            }
        }
    },
    'rad': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `((${stringArray.join(' + ')}) * Math.PI / 180.0)`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'rad',
                value: inputs
            }
        }
    },
    'deg': {
        group: 'operation',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `((${stringArray.join(' + ')}) * 180.0 / Math.PI)`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'deg',
                value: inputs
            }
        }
    },
    'Step': {
        group: 'neural',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 2,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `((${stringArray.join(' + ')}) >= 0.0 ? 1.0 : 0.0)`; // `(${getLoweLayerOfData(input)} >= 0.0 ? 1.0 : 0.0)`
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'Step',
                value: inputs
            }
        }
    },
    'ReLU': {
        group: 'neural',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 2,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `((${stringArray.join(' + ')}) >= 0.0 ? ${stringArray.join(' + ')} : 0.0)`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'ReLU',
                value: inputs
            }
        }
    },
    'Leaky ReLU': {
        group: 'neural',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 2,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `((${stringArray.join(' + ')}) >= 0.0 ? ${stringArray.join(' + ')} : 0.01 * (${stringArray.join(' + ')}))`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'Leaky ReLU',
                value: inputs
            }
        }
    },
    'PReLU': {
        group: 'neural',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 5,
            inputsMin: 2,
            inputsMax: 2
        },
        calculate: (input, calback_deeper) => {
            let x = calback_deeper(input.value[0] || 0);
            let a = calback_deeper(input.value[1] || 0.01);
            return `((${x}) >= 0.0 ? ${x} : ${a} * (${x}))`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = 2;
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'PReLU',
                value: inputs
            }
        }
    },
    'Sigmoid': {
        group: 'neural',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 6,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `(1.0 / (1.0 + Math.exp(-1.0 * ${stringArray.join(' + ')})))`; // (1.0 / (1.0 + Math.exp(-1.0 * ${getLoweLayerOfData(input)})))
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'Sigmoid',
                value: inputs
            }
        }
    },
    'Tanh': {
        group: 'neural',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 6,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `(2.0 / (1.0 + Math.exp(-2.0 * ${stringArray.join(' + ')})) - 1.0)`; // `(2.0 / (1.0 + Math.exp(-2.0 * ${getLoweLayerOfData(input)})) - 1.0)`
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'Tanh',
                value: inputs
            }
        }
    },
    'ArcTan': {
        group: 'neural',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 3,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `Math.atan(${stringArray.join(' + ')})`;
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(2, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'ArcTan',
                value: inputs
            }
        }
    },
    'SoftPlus': {
        group: 'neural',
        parameters: {
            useAsBase: true,
            chanceToUse: 0.15,
            complexity: 6,
            inputsMin: 1,
            inputsMax: 6
        },
        calculate: (input, calback_deeper) => {
            let stringArray = [];
            input.value.forEach(val => stringArray.push(`${calback_deeper(val)}`))
            return `Math.log(1.0 + Math.exp(${stringArray.join(' + ')}))`; // `Math.log(1.0 + Math.exp(${getLoweLayerOfData(input)}))`
        },
        random: (variables, requestExpression) => {
            let input_cnt = random_lowChance(1, 6);
            let inputs = [];
            for (var i = 0; i < input_cnt; i++) inputs.push(requestExpression(variables));
            return {
                type: 'SoftPlus',
                value: inputs
            }
        }
    }
}

Object.defineProperty(EXPRESSIONS, "length", { enumerable: false, writable: false, value: Object.keys(EXPRESSIONS).length });
Object.defineProperty(EXPRESSIONS, "forEach", { enumerable: false, writable: false, value: cb => Object.keys(EXPRESSIONS).forEach((k, i) => cb(EXPRESSIONS[k], k, i)) });






const declarations = [
    {
        name: "const",
        type: "any",
        scope: "local",
        modify: false
    },
    {
        name: "var",
        type: "any",
        scope: "local",
        modify: true
    },
    {
        name: "assign",
        type: "any",
        scope: "local",
        modify: false
    }
]

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
        } else
            output_string += ((x.multiplier | 0) > 0 || (x.multiplier | 0) < 0) ? `(${x.value} * ${Math.pow(10, x.multiplier | 0)})` : x.value;
        return output_string
    }

    if ((typeof input.type === "undefined" || input.type === "default") && typeof input.value === "number")
        output += (input.value * Math.pow(10, input.multiplier | 0)) + inverted
    else if ((typeof input.type === "undefined" || input.type === "link") && typeof input.value === "string") {
        output += (((input.multiplier | 0) > 0 || (input.multiplier | 0) < 0) ? `(${input.value} * ${Math.pow(10, input.multiplier | 0)})` : input.value) + inverted;
    } else
        output = EXPRESSIONS[input.type].calculate(input, getLoweLayerOfData);
    return output;
}

const geneCompiler = (gnetic_code) => {
    let randomFilename = genString(24);
    let sim_dir = `sim_${timestamp(null, "YYYY-MM-DD")}`
    console.log("########### Starting test ###########\n");
    console.log(`Executing GPCG Gene compiler with the following data:`)
    let inputRows = [];
    let gene_info = {};
    let gene_config = {};
    gnetic_code.forEach(codeLineArray => {
        if (codeLineArray[0] === 'signature') gene_info = codeLineArray[1];
        if (codeLineArray[0] === 'config') gene_config = codeLineArray[1];
    })
    gnetic_code.forEach(row => inputRows.push(JSON.stringify(row)));
    inputRows.forEach(row => console.log(row.black.bgWhite))
    let targetFile = `./gen/${sim_dir}/${randomFilename}.js`
    let generatedCodeLines = generate_Code(gnetic_code);
    generatedCodeLines.unshift(`\targs = Array.isArray(args) ? args : [args]; // Function input is always an array`);
    generatedCodeLines.unshift(`\tlet args = JSON.parse(JSON.stringify(arg_in)) // AVOID MUTATION OF INPUT ARGUMENTS, we do not want hell to break lose`);
    generatedCodeLines.unshift(`module.exports = exports = (arg_in) => {`);
    generatedCodeLines.unshift(`const GENETIC_SOURCE_CODE = ${JSON.stringify(gnetic_code)};`);   // Store GENE source code into file
    generatedCodeLines.unshift(`// GPCG - Compiled Genetic Code\n// Github: https://github.com/Jozo132/GPCG\n// Configuration: ${JSON.stringify(gene_config)}\n// Ancestor ID signature: ${gene_info.ancestor}\n// Generation ${gene_info.generation - gene_info.generation_offset}\n// Mutation ID signature: ${gene_info.uuid}\n// Timestamp: ${timestamp()}`);
    //generatedCodeLines.unshift(`const ext_sqrt = require('${BRAIN_folder}/squareRoot_inMemory')`); // Future long-term gobal function store
    generatedCodeLines.push('};')
    let generatedCode = generatedCodeLines.join('\n');
    console.log("Gene compiled! Code ready to be ported into a NodeJS module");
    console.log(targetFile.black.bgYellow);
    generatedCodeLines.forEach(row => console.log(row.black.bgWhite));
    let last = [];
    const execute = code => {
        for (var i = -10; i <= 10; i += 1) {
            let args = [i, i-1];
            let returned = code(args);
            let delta = [];

            let returned_str_A = [];
            let delta_str_A = [];

            returned.forEach((val, i) => {
                delta[i] = val - (last[i] || 0)
                returned_str_A.push(val.toFixed(4));
                delta_str_A.push(delta[i].toFixed(4));
            })
            last = returned;



            console.log(`function([ ${args.join(' , ')} ])  =>  [ ${returned_str_A.join(' , ')} ] \tdelta [ ${delta_str_A.join(' , ')} ]`)
        }
    }
    // Just execute the code
    //localExecution(generatedCode, execute);
    // Store generated code locally and execute
    storeFs_and_execute(targetFile, generatedCode, execute);
}




/**
 * @param {{ ignore?: Object; }} config
 * @param {String[]} variables
 * @param {number} level
 */
const randomExpression = (config, variables, level) => {
    config = config || {}
    let ignore = config.ignore || []
    let expression = {
        type: '',
        value: [] || 0 || '',
        multiplier: 0,
        inverted: false
    }
    let options = [];
    let allOptions = [];
    let chance = Math.random();
    if (level === 0)
        EXPRESSIONS.forEach((EXPR, name) => {
            if (EXPR.parameters.useAsBase) {
                if (EXPR.parameters.chanceToUse >= chance && !ignore.includes(EXPR.group)) options.push(name);
                allOptions.push(name);
            }
        })
    else
        EXPRESSIONS.forEach((EXPR, name) => {
            if (EXPR.parameters.chanceToUse >= chance && !ignore.includes(EXPR.group)) options.push(name);
            allOptions.push(name);
        })

    var selectedExpression = options.length > 0 ? random_item(options) : random_item(allOptions);
    expression = EXPRESSIONS[selectedExpression].random(variables, vars => randomExpression(config, vars, level + 1));
    return expression
}



const incrementCharactedName = c => { const same = (str, char) => { let i = str.length; while (i--) if (str[i] !== char) return false; return true; }; const nextLetter = l => l < 90 ? String.fromCharCode(l + 1) : 'A'; var u = c.toUpperCase(); if (same(u, 'Z')) { var txt = ''; var i = u.length; while (i--) txt += 'A'; return (txt + 'A'); } else { var p = ""; var q = ""; if (u.length > 1) { p = u.substring(0, u.length - 1); q = String.fromCharCode(p.slice(-1).charCodeAt(0)); } var l = u.slice(-1).charCodeAt(0); var z = nextLetter(l); return (z === 'A') ? (p.slice(0, -1) + nextLetter(q.slice(-1).charCodeAt(0)) + z).toLowerCase() : (p + z).toLowerCase(); } }





const create_random_genetic_code = sizeinput => {
    let variable_character_name = 'a';
    const size = sizeinput || 55;
    const ancestorId = genString(16);
    let stats = ["signature", { ancestor: ancestorId, generation: 1, generation_offset: 0, uuid: ancestorId }]
    let configuration = ["config", { inputs: ["number", "number"], outputs: ["number", "number", "number", "number"] }]
    var random_code = [];

    var declaredVariables = [];
    // @ts-ignore
    configuration[1].inputs.forEach((type, index) => declaredVariables.push({ name: 'input', type: type, id: `args[${index}]`, modify: false }))
    for (var done_buying = false, x = 0; !done_buying && (x < size); x++) {
        var row = [];
        var selected = {};
        let declaredStuff = {}
        declaredVariables.forEach(variable => {
            if (variable.name === 'var' || variable.name === 'let') declaredStuff.editable = declaredStuff.editable || 1;
            if (variable.name === 'const' || variable.name === 'input') declaredStuff.static = declaredStuff.static || 1;
        })
        if (declaredStuff.editable > 0) { // If variables already exist, use option to modify them
            let options = ["const", "var", "assign"];
            let x = options[random_chance(0, options.length - 1)];
            declarations.forEach(decl => { if (decl.name === x) selected = JSON.parse(JSON.stringify(decl)); });
        } else {
            let options = ["const", "var"];
            let x = options[random_chance(0, options.length - 1)];
            declarations.forEach(decl => { if (decl.name === x) selected = JSON.parse(JSON.stringify(decl)); });
        }
        let id = '';
        if (selected.name === 'assign') {
            let editableOptions = [];
            declaredVariables.forEach(declared => { if (declared.modify) editableOptions.push(declared.id); });
            id = random_item(editableOptions);
        } else {
            id = variable_character_name; //selected.identifier + genString(8);
            variable_character_name = incrementCharactedName(variable_character_name);
        }

        var value = [];
        var variables = [];
        declaredVariables.forEach(variable => variables.push(variable.id))
        value = [randomExpression({}, variables, 0)];
        declaredVariables.push({ name: selected.name, id: id, modify: selected.modify });
        row = [selected.name, id, value]
        random_code.push(row);
        if (Math.random() > 0.9) done_buying = true;
    }


    var variables = [];
    declaredVariables.forEach(variable => variables.push(variable.id))
    var returnedOutput = [];
    // @ts-ignore
    configuration[1].outputs.forEach(type => {
        if (type === 'number') returnedOutput.push(randomExpression({ ignore: ['constant'] }, variables, 0))
    });
    random_code.push(['return', returnedOutput]);

    console.log(`####################################`)
    console.log(`########  DONE GENERATING  #########`)
    console.log(`####################################`)
    console.log(JSON.stringify(stats))
    console.log(JSON.stringify(configuration))
    random_code.forEach(line => console.log(JSON.stringify(line)))
    console.log(`####################################`)

    var genetic_code = [];

    genetic_code.push(stats);
    genetic_code.push(configuration);
    random_code.forEach(line => genetic_code.push(line));

    geneCompiler(genetic_code);
}

create_random_genetic_code();



/*
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
            case 'Step': {
                output += `(${getLoweLayerOfData(input)} >= 0.0 ? 1.0 : 0.0)` + inverted;
                break;
            }
            case 'ReLU': {
                output += `(${getLoweLayerOfData(input)} > 0.0 ? ${getLoweLayerOfData(input)} : 0.0)` + inverted;
                break;
            }
            case 'Leaky ReLU': {
                output += `(${getLoweLayerOfData(input)} >= 0.0 ? ${getLoweLayerOfData(input)} : 0.01 * ${getLoweLayerOfData(input)})` + inverted;
                break;
            }
            case 'PReLU': {
                let x = compile_formula(input.value[0] || 0);
                let a = compile_formula(input.value[1] || 0.01);
                output += `(${x} >= 0.0 ? ${x} : ${a} * ${x})` + inverted;
                break;
            }
            case 'Sigmoid': {
                output += `(1.0 / (1.0 + Math.exp(-1.0 * ${getLoweLayerOfData(input)})))` + inverted;
                break;
            }
            case 'Tanh': {
                output += `(2.0 / (1.0 + Math.exp(-2.0 * ${getLoweLayerOfData(input)})) - 1.0)` + inverted;
                break;
            }
            case 'ArcTan': {
                output += `Math.atan(${getLoweLayerOfData(input)})`
                break;
            }
            case 'SoftPlus': {
                output += `Math.log(1.0 + Math.exp(${getLoweLayerOfData(input)}))` + inverted;
                break;
            }

            default:
                if (Array.isArray(input.value)) output += getLoweLayerOfData(input);
                else output += input.value;
                break;
        }
    return output;
}
*/





const example_output_data = [
    ["signature", { ancestor: '2ECVyQYjd7QLoa', generation: 6, generation_offset: 2, uuid: 'ItRAwxaIkshSOU' }],
    ["const", 'num_const_zc91Xi3U', [{ type: "mul", value: [{ type: "sin", value: [{ type: 'input', value: 0 }], multiplier: 1 }, { value: 0.41, multiplier: 1 }, { value: 0.5 }] }]],
    ["var", 'num_var_Nq9qdV98', [{ type: "linearFunction", value: [{ value: 0.82, multiplier: 0 }, { type: "round", value: 'num_const_zc91Xi3U' }, { type: "sin", value: [{ type: 'input', value: 0 }] }] }]],
    ["assign", 'num_var_Nq9qdV98', [{ type: "scalar", value: [{ type: "SoftPlus", value: 'num_var_Nq9qdV98', multiplier: 1 }, { type: "cos", value: 'num_const_zc91Xi3U' }] }]],
    ["return", [{ type: undefined, value: 'num_var_Nq9qdV98', multiplier: 0, inverted: -1 }]]
    //["return", [{ value: 'ext_sqrt(16)' }]]   // Future long-term gobal function store
];







setTimeout(() => geneCompiler(example_output_data), 4000);

