import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const spinner = ora();

async function submitAnswer(year, day, part) {
  try {
    // Get the answer from output.txt
    const outputPath = path.join(process.cwd(), 'solutions', `year${year}`, `day${day}`, `part${part}`, 'output.txt');
    if (!fs.existsSync(outputPath)) {
      throw new Error(`No answer found at ${outputPath}. Run solve.js first.`);
    }
    const answer = fs.readFileSync(outputPath, 'utf-8').trim();

    // Launch browser
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

    // Navigate to puzzle page
    spinner.start('Navigating to puzzle page...');
    await page.goto(`https://adventofcode.com/${year}/day/${day}`, { waitUntil: 'networkidle2' });
    spinner.succeed('Loaded puzzle page');

    // Submit the answer
    spinner.start(`Submitting answer: ${answer}`);
    await page.evaluate((answer) => {
      document.querySelector('input[type="text"]').value = answer;
      document.querySelector('input[type="submit"]').click();
    }, answer);

    // Wait for response
    await page.waitForSelector('article', { timeout: 10000 });
    const responseText = await page.$eval('article', el => el.innerText);
    
    // Check the response
    if (responseText.includes("That's the right answer!")) {
      spinner.succeed(chalk.green('🎉 Correct answer! Puzzle completed!'));
    } else if (responseText.includes("That's not the right answer")) {
      spinner.fail(chalk.red('❌ Wrong answer. Try again.'));
      throw new Error('Wrong answer submitted');
    } else if (responseText.includes("You gave an answer too recently")) {
      spinner.warn(chalk.yellow('⏳ You must wait before trying again.'));
      throw new Error('Rate limited - must wait before trying again');
    } else {
      spinner.warn(chalk.yellow('Unexpected response. Check the website.'));
      throw new Error('Unexpected response from Advent of Code');
    }

    // Take screenshot of the response
    const screenshotPath = path.join(process.cwd(), 'solutions', `year${year}`, `day${day}`, `part${part}`, 'submit-response.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    await browser.close();
  } catch (error) {
    spinner.fail(`Error submitting answer: ${error.message}`);
    throw error;
  }
}

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

  if (!day || !part || !year) {
    throw new Error('Please provide --year, --day, and --part arguments');
  }

  return { day, part, year };
}

// Main execution
async function main() {
  try {
    const { year, day, part } = parseArgs();
    console.log(chalk.blue.bold(`\n🎄 Submitting Advent of Code ${year} - Day ${day}, Part ${part}\n`));
    await submitAnswer(year, day, part);
  } catch (error) {
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

main();
