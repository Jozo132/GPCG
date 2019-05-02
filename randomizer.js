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





const create_random_genetic_code = (options, callback) => {
    console.log(`Executing GPCG Random genetic code generator ...`)
    let variable_character_name = 'a';
    const size = options.size || 1000;
    const ancestorId = genString(16);
    let stats = ["signature", { ancestor: ancestorId, generation: 1, generation_offset: 0, uuid: ancestorId }]
    let configuration = ["config", { inputs: options.inputs || ["number", "number"], outputs: options.outputs || ["number", "number", "number", "number"] }]
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

    if (debug) console.log(`####################################`)
    console.log(`Random genetic code generated`)
    if (debug) console.log(`####################################`)
    if (debug) console.log(JSON.stringify(stats))
    if (debug) console.log(JSON.stringify(configuration))
    if (debug) random_code.forEach(line => console.log(JSON.stringify(line)))
    if (debug) console.log(`####################################`)

    var genetic_code = [];

    genetic_code.push(stats);
    genetic_code.push(configuration);
    random_code.forEach(line => genetic_code.push(line));

    callback(genetic_code);
}

const setConfig = config => {
    debug = config.PARAMS.debug;
    DECLARATIONS = config.DECLARATIONS;
    EXPRESSIONS = config.EXPRESSIONS;
    random_chance = config.FUNCTIONS.random_chance;
    random_item = config.FUNCTIONS.random_item;
    genString = config.FUNCTIONS.genString;
}

module.exports = {
    init: setConfig,
    generate: create_random_genetic_code
}