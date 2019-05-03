// @ts-check
'use strict';
var colors = require('colors');

const moment = require('moment');

const timestamp = (input, format) => { if (input) return format ? moment(input).format(format) : moment(input).format("YYYY-MM-DD HH:mm:ss"); else return format ? moment().format(format) : moment().format("YYYY-MM-DD HH:mm:ss"); };

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


/**
 * @param {any[]} array
 * @returns radnom array option
 * @example
 * random_item([1,2,3]); // Output: 3
 */
const random_item = array => array[random_chance(0, array.length - 1)]


/**
 * @param {number | boolean} is
 * @returns {number} -1 or 1
 * @example
 * isInverted()         // Output:  1
 * isInverted(true);    // Output: -1
 * isInverted(false);   // Output:  1
 * isInverted(1)        // Output:  1
 * isInverted(0)        // Output:  1
 * isInverted(-1)       // Output: -1
 */
const isInverted = is => is < 0 || is === true ? -1 : 1;



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
            return `Math.cos((${stringArray.join(' + ')}) * Math.PI / 180.0)`;
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
            return `Math.max(${stringArray.join(' , ')})`;
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
            return `Math.min(${stringArray.join(' , ')})`;
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
            return `Math.tan((${stringArray.join(' + ')}) * Math.PI / 180.0)`;
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


const DECLARATIONS = [
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


module.exports = {
    PARAMS: {
        debug: true
        //const BRAIN_folder = `C:/brain`;  // Future long-term gobal function store
    },
    DECLARATIONS: DECLARATIONS,
    EXPRESSIONS: EXPRESSIONS,
    FUNCTIONS: {
        timestamp: timestamp,
        genString: genString,
        constrain: constrain,
        scale: scale,
        random_lowChance: random_lowChance,
        random_chance: random_chance,
        random_item: random_item,
        isInverted: isInverted
    }
}