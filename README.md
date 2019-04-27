# GPCG
Genetic Programming - Code Generation
===============

### Intro
Hello, my name is Jože.
I'm not a specialits nor did I do any extensive research on GA (Genetic Algorithms), GP (Genetic Programming), NN (Neural Networks), RL (Reinforcement Learning) or Q-learning / Deep Mind.

Whatever you read here, I am writing this from scratch. This means a lot of worngly used references and words will be used. I'll still try.

I'm unsure if the proposed code generation algorhitm exists, so I've already started working on it my own way.
There is a video online of something similar written in Python, but it was limited only to a few functions.

Personally, I've not found any examples of AI being programmed this way.
If something exactly like this exists or similar, please let me know!

In this project I'm trying to write a code generating AI.
The code is acting a little like Neural Networks, except the in the domain and freedom of a whole programming language, not just neurons and connections.

With that said, here is how it will play out:
Every time a 'program' 'evolves' it has a chance to create random small functions.
With iterations the function evolves, gets replaced by existing functions and dies or just dies of being useless.
If the function is useful and not yet implemented anywhere, it will be saved in the global 'brain' scope, where it is accessible to every other project.

Here is where it gets spooky.
Example:
Let's say we train an algorhitm code with this Genetic Programmer to play Game_A.
It should suck at playing in the beginning and only slowly get better.
Having the code running for (let's say) 8 hours it only gets about half decent results.
But having it running for so long, our algorhitm will have made some well trained function models in the global 'brain'.
Then let's say we start a new project to train playing a similar but different game Game_B.
This time it would aswell suck at the beginning, but it will grasp on what to do faster, because the global brain has 'experience' from previous runs.
Having the code running for (let's say) 1 hour it gets just as good as the other code last time, despite it being a different game, but with some slight similarities.
Now let's say we delete all project files for learning to play Game_A and we try again.
This time having the code run for (let's say) 10 minutes, we get the same results we had the first time in 8 hours.

This sounds farfetched, but here I've tested the basic functions to make this work (here using Node.JS, with code written as modules) and it does work with having access to all that is needed.

### Status
All in all about 5% finished!
A long way to go.

- File creation: Done!
- Import created file: Done!
- Import raw code without file creation: Done!
- Gene code to JS source code compiler: ~15% done
- Support for numeric data type assignments and manipulation (var, let, const): ~75% done
- Support standard mathematical numeric constants and operations: a lot (including conversion to degrees for angular functions)
- Support to extend numeric manipulation with individual mutation access: multiplication (x = x * 10^a), inversion (x = ax | a={1,-1})
- Support Neural Network transfer function operations: most of them // To act partially as an artificial neural network
- Support for re-assignments on modifiable variable types: yes

- Main GA for Gene code optimisation: not yet implemented.
- Add 100 things not yet implemented down bellow: not yet implemented.


### Overview
This is a research project, which is a work in progress with mind-blown plans for the future. (at least for me)
The plan is to make an inteligent code structuring AI, which will use GA to generate, mutate and optimise code structures (constants, variables and functions, where any of them can be in the 'local', 'temporary' or 'global'/'brain' scope ).
The compiled code will essentially work like a neural network, except here we have about as many options as there are combinations of (almost) everything JavaScript has to offer (that is possible to implement).
Gene structure is formatted by the GA in a kind-of standard way (my own way), which makes it totally imune to syntax errors (if the GA was properly setup and the gene compiler was not faulty).
Initially the plan is to generate code based on JavaScript (Node.JS) syntax. 
Because of the structure for the GA, it is certainly possible to compile other programming languages.

The Fitness function for GE will be based on:
- Code size (vertical (lines) and horizontal (nested) code size)
- Code complexity (sum of all operations' type weights)
- Solution to desired output (error)
- Code execution time

Code execution time should impact insignifficantly, because for the start here won't be any callbacks or timeouts/intervals in the genes yet. When implemented, this will impact population code execution performance and will then have more significant value in a decreased score for slow code.

In the future, if the AI generates really good and multi-purpose functions, it will put them in a global folder, accessible to new generations as read-only (possibly copied to their local project gen folder), where global code mutation will only be available to the source code id where it came from.
The useful discovered functions will have to be tested against all existing functions. The local function will be replaced, if alternative better or equal functions were found.
Every 'crossover' will at random times try to import one of the available modules/functions in the 'brain' folder.

There are a lot of technical details on mathematical mutation of 'formulas' which I have implemented.
The compiler already processes most of the parameters the code will ever have (for 'formula' values).
When mutating, a custom algo will be used, where we know which type the randomly selected values are, and their chance for changing the value itself  (0.1 -> 0.2 or 'x1' -> 'x2') will be higher than changing the type the value (0.1 -> 'x1').
The same thing goes for the type groups, switching from (neural:ReLU(x) -> neural:PReLU(x,y)) will be higher than changing group type (neural:ReLU(x) -> math:sin(x)).
This should make finding the right solution to a given problem smoother (probably).


If the GA finds its own function to multiple problems within the program itself, which has no alternative in the whole scope (GA running tests live with existing functions), it should create the function in the 'brain' memory of the project. 


If a reinforcement algo can be implemented here, this will imply every function aditionally learned from a project playing one game, can be accessed by another project playing a similar game, possibly decreasing learning time significantly every iteration, even when the requirements are complex. 
This GA algo would be a win-win for multiple similar (or different, who knows) projects. Because if implemented correctly, if the second game playing project finds an improvement in the other ones' brain 'memory', it would copy it and make it accessible to the first one as an option if the first project was doing new iterations, having new options for functions when the GA scans the brain functions available.

An issue appears here on how to define obsolete functions and clean up the brain of 'dead' cells/genes.
I've got a rough idea how to deal with it, but it's gonna be a while before this project reaches that point.

Brain functionality has shown to work with manually written code, which is exactly in syntax of what a 'brain' memory function would look like when saved in future updates.
I had to remove this functionality, because it's just unneeded complexity when most of the main code isn't even written yet.

### LATEST PROGRESS
Right now, a manually written example 'gene' code (which is used as a template) was succesfully compiled by the GENE COMPILER, creating a Node.JS module as output.
In the test.js file, the 'gene' code can be altered and tested if everything works.

The compiler processes line types on every row of the gene array at [0], which defines what it is used for. (var, const, return, ...) 
The compiler then prepares the string compiling technique, based on the line type and starts generating the 'formula' of the nested arguments.

The GA is not implemented yet!
It will 

### Prerequisites

* git	(Used for repository cloning/downloads)
* node.js	(Background system for Node-RED)

### Usage

Install required modules:
```bash
npm i
```

Run app:
```bash
node test
```

<img align="left" src="https://cdn.discordapp.com/attachments/421762597587648514/571751346026446856/2019-04-27_19_34_42-_README.md_-_GPCG_-_Visual_Studio_Code.png"/>
