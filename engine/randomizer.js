// @ts-check
'use strict';
var colors = require('colors');

var EXPRESSIONS;
var random_item;
var genString;
var random_chance;
var DECLARATIONS;
var debug = false;

/**
 * @param {{ ignore?: string[], maxDepth?: number; }} config
 * @param {String[]} variables
 * @param {number} level
 */
const randomExpression = (config, variables, level) => {
    config = config || {}
    let ignore = config.ignore || []
    if (config.maxDepth > level - 1) ignore.push('operation');
    let expression = {
        type: '',
        value: [] || 0 || '',
        multiplier: 0,
        inverted: false
    }
    let options = [];
    let allOptions = [];
    let chance = Math.random();
    if (level === 0) EXPRESSIONS.forEach((EXPR, name) => { if (EXPR.parameters.useAsBase) { if (EXPR.parameters.chanceToUse >= chance && !ignore.includes(EXPR.group)) options.push(name); allOptions.push(name); } });
    else EXPRESSIONS.forEach((EXPR, name) => { if (EXPR.parameters.chanceToUse >= chance && !ignore.includes(EXPR.group)) options.push(name); allOptions.push(name); });
    var selectedExpression = options.length > 0 ? random_item(options) : random_item(allOptions);
    expression = EXPRESSIONS[selectedExpression].random(variables, vars => randomExpression(config, vars, level + 1));
    return expression
}



const incrementCharacterName = c => { const same = (str, char) => { let i = str.length; while (i--) if (str[i] !== char) return false; return true; }; const nextLetter = l => l < 90 ? String.fromCharCode(l + 1) : 'A'; var u = c.toUpperCase(); if (same(u, 'Z')) { var txt = ''; var i = u.length; while (i--) txt += 'A'; return (txt + 'A'); } else { var p = ""; var q = ""; if (u.length > 1) { p = u.substring(0, u.length - 1); q = String.fromCharCode(p.slice(-1).charCodeAt(0)); } var l = u.slice(-1).charCodeAt(0); var z = nextLetter(l); return (z === 'A') ? (p.slice(0, -1) + nextLetter(q.slice(-1).charCodeAt(0)) + z).toLowerCase() : (p + z).toLowerCase(); } }


const cleanUp = genetic_code => {
    var cloned_genetic_code = JSON.parse(JSON.stringify(genetic_code));
    const typesToLookFor = ['const', 'var', 'let', 'assign', 'return'];
    const searchOperation = (operation, lookFor, ignore, callback) => { if (Array.isArray(operation.value)) operation.value.forEach(newOperation => searchOperation(newOperation, lookFor, ignore, callback)); else { if (lookFor.includes(operation.value) && !ignore.includes(operation.value)) callback(operation); } }
    const removeLines = (code, lines) => { let lines_ = lines.sort((a, b) => b - a); lines_.forEach(line => code.splice(line, 1)); }
    const reassignVariableNames = code => {
        var allUsedVariablenames = [];
        var variable_comparison = [];
        var newVarName = "a";
        code.forEach(line => {
            var thisType = line[0];
            if (typesToLookFor.includes(thisType) && thisType !== 'return') {
                var variableName = line[1];
                if (!allUsedVariablenames.includes(variableName)) {
                    allUsedVariablenames.push(variableName);
                    variable_comparison.push({ nameBefore: variableName, nameNow: newVarName });
                    newVarName = incrementCharacterName(newVarName);
                }
            }
        });
        code.forEach(line => {
            var lineType = line[0];
            var operation = lineType === 'return' ? line[1] : line[2];
            var lookFor = [];
            variable_comparison.forEach(vc => lookFor.push(vc.nameBefore));
            if (typesToLookFor.includes(lineType)) {
                if (lineType !== 'return') { var newValue = variable_comparison.find(v => v.nameBefore === line[1]).nameNow; line[1] = newValue; }
                operation.forEach(op => searchOperation(op, lookFor, [], operation => { var newValue = variable_comparison.find(v => v.nameBefore === operation.value).nameNow; operation.value = newValue; }));
            }
        });
        return code;
    }
    const getUnusedLinesOfCode = code => {
        var allUsedVariables = [];
        code.forEach((line, index) => {
            var thisType = line[0];
            if (typesToLookFor.includes(thisType) && thisType !== 'return') { var variableName = line[1]; allUsedVariables.push({ index: index, name: variableName, used: 0 }); }
        });
        allUsedVariables.forEach(X => {
            for (var line = X.index; line < code.length; line++) {
                var lookFor = [X.name]
                var lineType = code[line][0];
                var operation = lineType === 'return' ? code[line][1] : code[line][2]
                operation.forEach(op => searchOperation(op, lookFor, [], operation => { if (X.name === operation.value) X.used++; }));
            }
        });
        var allUnusedVariables = [];
        allUsedVariables.forEach(x => { if (x.used === 0) allUnusedVariables.push(x.index); });
        return allUnusedVariables;
    }

    for (var finished = false; !finished;) {
        var unusedLines = getUnusedLinesOfCode(cloned_genetic_code);
        if (unusedLines.length > 0) removeLines(cloned_genetic_code, unusedLines);
        else { finished = true; console.log(`Cleanup finised!`); }
    }
    var clean_genetic_data = reassignVariableNames(cloned_genetic_code);
    return clean_genetic_data;
}




const create_random_genetic_code = (options, callback) => {
    console.log(`Executing GPCG Random genetic code generator ...`)
    let variable_character_name = 'a';
    const maxSize = options.maxSize || 1000;
    const ancestorId = genString(16);
    let stats = ["signature", { ancestor: ancestorId, generation: 1, generation_offset: 0, uuid: ancestorId }]
    let configuration = ["config", { inputs: options.inputs || ["number", "number"], outputs: options.outputs || ["number", "number", "number", "number"] }]
    var random_code = [];
    var declaredVariables = [];
    // @ts-ignore
    configuration[1].inputs.forEach((type, index) => declaredVariables.push({ name: 'input', type: type, id: `args[${index}]`, modify: false }))
    for (var done = false, x = 0; !done && (x < maxSize); x++) {
        var row = [];
        var selected = {};
        let declaredStuff = {}
        declaredVariables.forEach(variable => {
            if (variable.name === 'var' || variable.name === 'let') declaredStuff.editable = declaredStuff.editable || 1;
            if (variable.name === 'const' || variable.name === 'input') declaredStuff.static = declaredStuff.static || 1;
        })
        if (declaredStuff.editable > 0) { // If editable variables exist, we can modify them
            let options = ["const", "var", "assign"];
            let x = options[random_chance(0, options.length - 1)];
            DECLARATIONS.forEach(decl => { if (decl.name === x) selected = JSON.parse(JSON.stringify(decl)); });
        } else {
            let options = ["const", "var"];
            let x = options[random_chance(0, options.length - 1)];
            DECLARATIONS.forEach(decl => { if (decl.name === x) selected = JSON.parse(JSON.stringify(decl)); });
        }
        let id = '';
        if (selected.name === 'assign') {
            let editableOptions = [];
            declaredVariables.forEach(declared => { if (declared.modify) editableOptions.push(declared.id); });
            id = random_item(editableOptions);
        } else {
            id = variable_character_name;
            variable_character_name = incrementCharacterName(variable_character_name);
        }
        var value = [];
        var variables = [];
        declaredVariables.forEach(variable => variables.push(variable.id))
        value = [randomExpression({}, variables, 0)];
        declaredVariables.push({ name: selected.name, id: id, modify: selected.modify });
        row = [selected.name, id, value]
        random_code.push(row);
        if (Math.random() > 0.9) done = true;
    }

    var variables = [];
    declaredVariables.forEach(variable => variables.push(variable.id))
    var returnedOutput = [];
    // @ts-ignore
    configuration[1].outputs.forEach(type => { if (type === 'number') returnedOutput.push(randomExpression({ ignore: ['constant'], maxDepth: options.maxDepth }, variables, 0)) });
    random_code.push(['return', returnedOutput]);
    console.log(`Random genetic code generated`)
    var genetic_code = [];
    genetic_code.push(stats);
    genetic_code.push(configuration);
    random_code.forEach(line => genetic_code.push(line));
    var clean_genetic_code = cleanUp(genetic_code)
    callback(clean_genetic_code);
}

const setConfig = config => {
    debug = config.PARAMS.debug;
    DECLARATIONS = config.DECLARATIONS;
    EXPRESSIONS = config.EXPRESSIONS;
    random_chance = config.FUNCTIONS.random_chance;
    random_item = config.FUNCTIONS.random_item;
    genString = config.FUNCTIONS.genString;
}

module.exports = config => {
    var module = {};
    setConfig(config);
    module.generate = create_random_genetic_code;
    module.cleanUp = cleanUp;
    return module;
}