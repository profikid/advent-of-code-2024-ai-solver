import Anthropic from '@anthropic-ai/sdk';
import tools from './tools.js';
import { useTools } from './useTools.js';
import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import puppeteer from 'puppeteer';
import TurndownService from 'turndown';
import dotenv from 'dotenv';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const spinner = ora();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

async function promptForDayAndPart(defaultDay, defaultPart, defaultYear) {
  let year = defaultYear;
  if (!year) {
    year = await question(chalk.blue('Enter the year (default: 2024): '));
    if (!year) year = '2024';
    if (isNaN(year) || year < 2015) {
      console.log(chalk.red('Invalid year. Please enter a year 2015 or later.'));
      rl.close();
      process.exit(1);
    }
  }

  let day = defaultDay;
  if (!day) {
    day = await question(chalk.blue('Enter the day number (1-25): '));
    if (isNaN(day) || day < 1 || day > 25) {
      console.log(chalk.red('Invalid day number. Please enter a number between 1 and 25.'));
      rl.close();
      process.exit(1);
    }
  }

  let part = defaultPart;
  if (!part) {
    part = await question(chalk.blue('Enter the part number (1 or 2): '));
    if (part !== '1' && part !== '2') {
      console.log(chalk.red('Invalid part number. Please enter 1 or 2.'));
      rl.close();
      process.exit(1);
    }
  }

  return { day: parseInt(day), part: parseInt(part), year: parseInt(year) };
}

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let day = null;
  let part = null;
  let year = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--day' && i + 1 < args.length) {
      day = args[i + 1];
      i++;
    } else if (args[i] === '--part' && i + 1 < args.length) {
      part = args[i + 1];
      i++;
    } else if (args[i] === '--year' && i + 1 < args.length) {
      year = args[i + 1];
      i++;
    }
  }

  return { day, part, year };
}

// Create solutions directory if it doesn't exist
const solutionsDir = path.join(process.cwd(), 'solutions');
if (!fs.existsSync(solutionsDir)) {
  fs.mkdirSync(solutionsDir, { recursive: true });
}

async function extractPuzzleContent(day, part, year, paths) {
  // Create year and day directories if they don't exist
  const yearDir = path.join(solutionsDir, `year${year}`);
  const dayDir = path.join(yearDir, `day${day}`);
  const partDir = path.join(dayDir, `part${part}`);

  fs.mkdirSync(yearDir, { recursive: true });
  fs.mkdirSync(dayDir, { recursive: true });
  fs.mkdirSync(partDir, { recursive: true });

  // Check if files already exist
  if (fs.existsSync(paths.input) && fs.existsSync(paths.puzzle)) {
    console.log(chalk.yellow('Input and puzzle files already exist, skipping extraction...'));
    const input = fs.readFileSync(paths.input, 'utf-8');
    const puzzle = fs.readFileSync(paths.puzzle, 'utf-8');
    return { input, puzzle };
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();

    // Set cookie for authentication
    const cookie = process.env.cookie;
    if (!cookie) {
      throw new Error('No cookie found in environment variables');
    }

    await page.setCookie({
      name: 'session',
      value: cookie,
      domain: 'adventofcode.com',
      path: '/'
    });

    // Fetch the input text
    spinner.start('Fetching puzzle input...');
    await page.goto(`https://adventofcode.com/${year}/day/${day}/input`, { waitUntil: 'networkidle2' });
    const inputText = await page.$eval('pre', el => el.textContent);
    spinner.succeed('Puzzle input fetched');

    // Save input to file
    fs.writeFileSync(paths.input, inputText);

    // Fetch the puzzle description
    spinner.start('Fetching puzzle description...');
    await page.goto(`https://adventofcode.com/${year}/day/${day}#part${part}`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('article');
    const articleHTML = await page.$eval('main', el => el.innerHTML);
    spinner.succeed('Puzzle description fetched');

    // Take screenshot of the puzzle
    await page.screenshot({
      path: paths.screenshot,
      fullPage: true
    });

    // Convert HTML to Markdown
    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(articleHTML);

    // Save markdown to file
    fs.writeFileSync(paths.puzzle, markdown);

    await browser.close();

    return {
      input: inputText,
      puzzle: markdown
    };
  } catch (error) {
    spinner.fail(`Error extracting puzzle content: ${error.message}`);
    throw error;
  }
}

async function loadFile(filepath, description) {
  spinner.start(`Loading ${description}...`);
  const content = fs.readFileSync(filepath, 'utf-8');
  spinner.succeed(`Loaded ${description}`);
  return content;
}

async function main() {
  // Get day, part, and year from command line or prompt
  const { day: argDay, part: argPart, year: argYear } = parseArgs();
  const { day, part, year } = await promptForDayAndPart(argDay, argPart, argYear);
  console.log(chalk.blue.bold(`\n🎄 Advent of Code ${year} - Day ${day}, Part ${part}\n`));

  // Get file paths
  const yearDir = path.join(solutionsDir, `year${year}`);
  const dayDir = path.join(yearDir, `day${day}`);
  const partDir = path.join(dayDir, `part${part}`);
  const paths = {
    input: path.join(partDir, 'input.txt'),
    puzzle: path.join(partDir, 'puzzle.md'),
    screenshot: path.join(partDir, 'puzzle.png'),
    test: path.join(partDir, 'test.js'),
    solution: path.join(partDir, 'solution.js'),
    solve: path.join(partDir, 'solve.js'),
    output: path.join(partDir, 'output.txt')
  };

  // First extract the puzzle content
  console.log(chalk.yellow('\n📥 Extracting puzzle content...\n'));
  const { input, puzzle } = await extractPuzzleContent(day, part, year, paths);

  // Then load the files and solve the puzzle
  console.log(chalk.yellow('\n🚀 Starting solution generation...\n'));
  
  function replaceVariables(template, variables) {
    return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
      return key in variables ? variables[key] : match;
    });
  }

  const vars = {
    day,
    part,
    year,
    input: input.slice(0, 200),
    paths: {
      input: paths.input,
      solution: paths.solution,
      test: paths.test,
      solve: paths.solve,
      output: paths.output
    }
  };

  let payload = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 8192,
    tools,
    temperature: 1,
    system: replaceVariables(
      `You are a professional JavaScript puzzle solver. Your goal is to create a test, a solution, and solve the puzzle.
      you are a very careful programmer that writes code that is clean and will take care for undefined, out of bound etc.
      Ensure you go over every step of the puzzle before writing the code.
0. check if the puzzle has a part two. If so, make sure you implement part one and on top of that implement part two. 
1. {{paths.test}} should contain ALL the conditions stated in the puzzle to solve the puzzle (should test {{paths.solution}}). only use ES6 module style, jest. The tests should contain name day, part description, and should be stable
2. {{paths.solution}} should contain the actual solution based on the input. It should export default with a single object param for the input. (export default function solution(input){...} )
3. run.js to run the test, and if the test fails, it should create a new test/solution.
4. If passed, it should create {{paths.solve}} that takes real input like the example.
5. When everything is ready run solve and save the output to output.txt, if this fails only recreate the solve

solve.js looks something like this:
\`\`\`
import fs from 'fs';
import solution from './solution.js';

// This is the actual input 
const input = fs.readFileSync('./input.txt', 'utf-8')

// carefully parse the input so it will work in the solution

result = solution(input);

// Write here your solution

fs.writeFileSync('./output.txt', result);
\`\`\`

An excerpt of {{paths.input}}:
{{input}}

The puzzle always contains example data and answer.
Think step by step, If you got it right the first time you get $1000 dollars! and we pay of the mortgage of your mom
Todays puzzle is day {{day}} part {{part}. Only write the answer of the current part!
`,
      vars
    ),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: puzzle,
          },
        ],
      },
    ],
  };

  async function processToolUses() {
    try {
      spinner.start('Generating solution with Claude...');
      let response = await anthropic.messages.create(payload);
      spinner.succeed('Received initial response from Claude');

      while (response.stop_reason === 'tool_use') {
        const toolUse = response.content.find((block) => block.type === 'tool_use');
        if (toolUse) {
          // Execute the corresponding tool function from useTools
          if (useTools[toolUse.name]) {
            spinner.start(`Executing tool: ${chalk.cyan(toolUse.name)}...`);
            const toolResult = await useTools[toolUse.name]({...toolUse.input, day, part, year});
            spinner.succeed(`Tool ${chalk.cyan(toolUse.name)} executed successfully`);

            // Add the assistant's tool use message
            payload.messages.push({
              role: 'assistant',
              content: [toolUse],
            });

            // Add the tool result as a user message
            payload.messages.push({
              role: 'user',
              content: [
                {
                  type: 'tool_result',
                  tool_use_id: toolUse.id,
                },
              ],
            });

            // Send the updated messages back to Claude
            spinner.start('Getting next step from Claude...');
            response = await anthropic.messages.create(payload);
            spinner.succeed('Received next step from Claude');
          } else {
            spinner.fail(`Tool ${chalk.red(toolUse.name)} not found in useTools.`);
            break;
          }
        } else {
          spinner.fail('No tool_use block found in the response.');
          break;
        }
      }

      // Final response from Claude after all tool uses
      console.log(chalk.green.bold('\n🎉 Solution Generation Complete!\n'));
      
      // Save response to summary.md
      const summaryPath = path.join(process.cwd(), 'summary.md');
      const summaryContent = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n\n');
      fs.writeFileSync(summaryPath, summaryContent, 'utf8');
      console.log(chalk.blue(`Summary saved to: ${summaryPath}`));

      console.log(chalk.yellow('Final response from Claude:'));
      response.content.forEach(block => {
        if (block.type === 'text') {
          console.log(chalk.white(block.text));
        }
      });
    } catch (error) {
      spinner.fail('Error processing tool uses:');
      console.error(chalk.red(error));
    }
  }

  await processToolUses();
  // Close readline interface
  rl.close();
}

// Start the process
main().catch(error => {
  console.error(chalk.red('Error:', error));
  process.exit(1);
});
