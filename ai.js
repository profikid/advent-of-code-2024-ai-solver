import Anthropic from '@anthropic-ai/sdk';
import tools from './tools.js';
import { useTools } from './useTools.js';
import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import puppeteer from 'puppeteer';
import TurndownService from 'turndown';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const day = 2;
const part = 1;
const spinner = ora();

// Create solutions directory if it doesn't exist
const solutionsDir = path.join(process.cwd(), 'solutions');
if (!fs.existsSync(solutionsDir)) {
  fs.mkdirSync(solutionsDir, { recursive: true });
}

// Define paths for day's files
const dayDir = path.join(solutionsDir, `day${day}`);
if (!fs.existsSync(dayDir)) {
  fs.mkdirSync(dayDir, { recursive: true });
}

const paths = {
  input: path.join(dayDir, 'input.txt'),
  puzzle: path.join(dayDir, 'puzzle.md'),
  screenshot: path.join(dayDir, 'puzzle.png'),
  test: path.join(dayDir, 'test.js'),
  solution: path.join(dayDir, 'solution.js'),
  solve: path.join(dayDir, 'solve.js'),
  output: path.join(dayDir, 'output.txt')
};

console.log(chalk.blue.bold(`🎄 Advent of Code - Day ${day}, Part ${part}`));

async function extractPuzzleContent() {
  try {
    spinner.start('Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      defaultViewport: null
    });
    const page = await browser.newPage();
    spinner.succeed('Browser launched');

    // Set the session cookie
    spinner.start('Setting up session cookie...');
    await page.setCookie({
      name: 'session',
      value: process.env.cookie?.replace(/"/g, '') || '', // Remove any quotes from the cookie value
      domain: 'adventofcode.com',
      path: '/',
      expires: Math.floor(new Date('2026-01-01').getTime() / 1000),
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    });
    spinner.succeed('Session cookie set');

    // Fetch the input text
    spinner.start('Fetching puzzle input...');
    await page.goto(`https://adventofcode.com/2024/day/${day}/input`, { waitUntil: 'networkidle2' });
    const inputText = await page.$eval('pre', el => el.textContent);
    fs.writeFileSync(paths.input, inputText);
    spinner.succeed('Puzzle input saved');

    // Get the puzzle description
    spinner.start('Fetching puzzle description...');
    await page.goto(`https://adventofcode.com/2024/day/${day}`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('article');
    const articleHTML = await page.$eval('article', el => el.innerHTML);
    spinner.succeed('Puzzle description fetched');

    // Convert HTML to Markdown
    spinner.start('Converting puzzle description to markdown...');
    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(articleHTML);
    fs.writeFileSync(paths.puzzle, markdown);
    spinner.succeed('Puzzle description saved');

    // Take a screenshot
    spinner.start('Taking screenshot...');
    await page.screenshot({ path: paths.screenshot, fullPage: true });
    spinner.succeed('Screenshot saved');

    await browser.close();
    console.log(chalk.green('\n✨ Puzzle content extracted successfully!\n'));
  } catch (error) {
    spinner.fail('Error extracting puzzle content');
    console.error(chalk.red(error));
    process.exit(1);
  }
}

async function loadFile(filepath, description) {
  spinner.start(`Loading ${description}...`);
  const content = fs.readFileSync(filepath, 'utf-8');
  spinner.succeed(`Loaded ${description}`);
  return content;
}

async function main() {
  // First extract the puzzle content
  console.log(chalk.yellow('\n📥 Extracting puzzle content...\n'));
  await extractPuzzleContent();

  // Then load the files and solve the puzzle
  console.log(chalk.yellow('\n🚀 Starting solution generation...\n'));
  
  const input = await loadFile(paths.input, 'puzzle input');
  const puzzle = await loadFile(paths.puzzle, 'puzzle description');

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  function replaceVariables(template, variables) {
    return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
      return key in variables ? variables[key] : match;
    });
  }

  const vars = {
    day,
    part,
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
    temperature: 0,
    system: replaceVariables(
      `You are a professional JavaScript puzzle solver. Your goal is to create a test, a solution, and solve the puzzle.
1. {{paths.test}} should contain ALL the conditions stated in the puzzle to solve the puzzle (should test {{paths.solution}}). only use ES6 module style
2. {{paths.solution}} should contain the actual solution based on the input. It should export default with a single object param for the input.
3. run.js to run the test, and if the test fails, it should create a new test/solution.
4. If passed, it should create {{paths.solve}} that takes real input like the example.

{{paths.solve}} looks something like this:
\`\`\`
import fs from 'fs';
import solution from '{{paths.solution}}';

// This is the actual input
const input = fs.readFileSync('{{paths.input}}', 'utf-8');

// Here you should parse the input following the puzzle's description

let parsedInput = ''; // Here will be the solution

result = solution(parsedInput);

// Write here your solution

fs.writeFileSync('{{paths.output}}', result);
\`\`\`

An excerpt of {{paths.input}}:
{{input}}

The puzzle always contains example data and answer.
Think step by step:
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
            await useTools[toolUse.name](toolUse.input);
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
}

// Start the process
main();
