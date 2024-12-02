import fs from 'fs';
import solution from 'solution.js';

// This is the actual input
const input = fs.readFileSync('day1.input.txt', 'utf-8');

function replaceVariables(template, variables) {
    return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
      return key in variables ? variables[key] : match;
    });
  }

// here you should parse the input following the puzzles description

let parsedInput = ''; // here will be the solutionh


result = solution(parsedInput);

// write here your solution 

fs.writeFileSync('output.txt', result);