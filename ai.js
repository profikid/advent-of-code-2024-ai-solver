import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import tools from './tools.js';

const input = fs.readFileSync('day1.input.txt', 'utf-8');
const puzzle = fs.readFileSync('day1.puzzle.md', 'utf-8');
const anthropic = new Anthropic();

function replaceVariables(template, variables) {
    return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
      return key in variables ? variables[key] : match;
    });
  }

  const vars = {
    day: 1,
    input: input.slice(0, 200)
  }

  let payload = {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8192,
    tools,
    temperature: 0,
    system: replaceVariables("You are a professional javascript puzzel solver.  your goal is to create a test, a solution and solve the puzzle. \n1. day{{day}}.test.js should contain all the conditions to solve the puzzle (should test day{{day}}.solution.js)\n2. day{{day}}.solution.js should contain the actual solution based on the input. It should export default with a single object param for the input\n3. run.js to run the test and if the test fails it should create a new test / solution\n4. if passed, it should create a day{{day}}.solve.js that takes real input like the example. \n\nday{{day}}.solve.js looks something like this:\n```\nimport fs from 'fs';\nimport solution from 'day{{day}}.solution.js';\n\n// This is the actual input\nconst input = fs.readFileSync('day{{day}}.input.txt', 'utf-8');\n\n// here you should parse the input following the puzzles description\n\nlet parsedInput = ''; // here will be the solution\n\n\nresult = solution(parsedInput);\n\n// write here your solution \n\nfs.writeFileSync('day{{day}}.output.txt', result);\n```\n\nAn excerpt of day{{day}}.input.txt:\n{{input}}\n\nThe puzzle always contains example data and answer.\nThink step by step: \n", vars),
    messages: [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": puzzle,
          }
        ]
      }
    ]
  }

// Replace placeholders like {{day}} with real values,
// because the SDK does not support variables.
let msg = await anthropic.messages.create(payload);

payload.messages.push(msg)
console.log(JSON.stringify(msg));