// @ts-check
"use strict";

var colors = require('colors');
const fs = require('fs');
const mkdirp = require('mkdirp');
const requireFromString = require('require-from-string');
const fe = (o, cb) => Object.keys(o).forEach((k, i) => cb(o[k], k, i))
const genString = len => { var text = ""; var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; if (len > 0) for (var i = 0; i < len; i++) text += possible.charAt(Math.floor(Math.random() * possible.length)); else for (var i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length)); return text; }
const sim_dir = 'sim_' + genString(10);
const exportedModule = code => `module.exports = exports = () => {\n${code}\n};\n`


const value_types = {
    0: 'default',
    1: 'link',
    2: 'bias__1',
    3: 'bias__0',
    4: 'bias_-1',

    5: "sum",
    6: "sub",
    7: "mul",
    8: "div",
    9: "linearFunction",
    10: "relu"
}


const codeline_type = {
    10000: "return",
    1: "declare"
}

const declaration_type = {
    0: "const",
    1: "var"
}



const compile_formula = (type, value) => {
    //if (type !== `default`)
    //  console.log(`Trying to compile formula for = ${type} :`, value);
    let output = '';
    switch (type) {
        case 'default':
            output += value;
            break;
        case 'linearFunction':
            let k = compile_formula(value_types[value[0].type], value[0].value);
            let x = compile_formula(value_types[value[1].type], value[1].value)
            let n = compile_formula(value_types[value[2].type], value[2].value)
            output = `(${k}*${x.charAt(0) === '-' ? `(${x})` : x}${n.charAt(0) === '-' ? n : `+${n}`})`
            //output = temp;
            break;
    }
    return output;
}


const compile_line = (codeLineArray, index) => {
    /** @type {string}   */
    let output = ``;
    //console.log(`Line \t${index} - Trying to compile\n`, codeLineArray)
    let line_type = codeline_type[codeLineArray[0]];
    switch (line_type) {
        case 'return':
            output = `return ${codeLineArray[1].join(' + ')};`;
            break;
        case 'declare':
            let X_type = declaration_type[codeLineArray[2]];
            let X_key = codeLineArray[1];
            let formulas = [];
            codeLineArray[3].forEach((value_Array) => {
                formulas.push(compile_formula(value_types[value_Array.type], value_Array.value));
            });
            let formula = formulas.join(' + ');

            output = `${X_type} ${X_key} = ${formula};\n`;
            break;
    }
    return output;
}


const generate_Code = abstract_code => {
    let compiled_code = ``;
    abstract_code.forEach((row, i) => {
        compiled_code += compile_line(row, i + 1);
    });
    //console.log(`FINISHED CODE!`)
    //console.log(compiled_code.black.bgWhite)
    return compiled_code;
}





//console.log(compiled_code.black.bgWhite)

let example_output_data = [
    [1, 'id_1', 0, [{ type: 9, value: [{ type: 0, value: 0.82 }, { type: 9, value: [{ type: 0, value: 0.41 }, { type: 0, value: -0.99 }, { type: 0, value: 0.01 }] }, { type: 0, value: -0.26 }] }]],          // Code line 1  >  const id_1 = (0.1) * (0.4) + (-0.2); 
    [10000, ['id_1']]
];


generate_Code(example_output_data);



const test = () => {
    let randomFilename = genString(24);
    let targetFile = `./gen/${sim_dir}/${randomFilename}.js`
    let generatedCode = generate_Code(example_output_data); // exportedModule(`console.log("${genString(128)}");`);

    console.log("The file generated!");
    console.log(generatedCode.black.bgWhite);
    //requireFromString(generatedCode)('test');   // Execute string code without storing it on disk

    mkdirp(`./gen/${sim_dir}`, e => {
        if (e) console.log(e)
        fs.writeFile(targetFile, exportedModule(generatedCode), err => {
            if (err) return console.log(err);
            console.log("The file was saved! Now executing it ...");
            try {
                console.log(require(targetFile)('test'));
            } catch (e) {
                console.log(`Failed to execute '${targetFile}'`, e)
            }
        });
    })


}

setTimeout(test, 1000);

