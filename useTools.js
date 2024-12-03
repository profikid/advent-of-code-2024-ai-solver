import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

function ensureDirExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFile(filePath, content) {
  ensureDirExists(filePath);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(chalk.green(`Created ${path.relative(process.cwd(), filePath)}`));
}

function runCommand(command, args) {
  try {
    const result = execSync(command, {
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf-8',
      ...args
    });
    console.log(chalk.green(result));
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    if (error.stdout) console.error(chalk.yellow('Output:', error.stdout));
    if (error.stderr) console.error(chalk.red('Error output:', error.stderr));
    throw error;
  }
}

function getFilePaths(day, part = 1, year = 2024) {
  const solutionsDir = path.join(process.cwd(), 'solutions');
  const yearDir = path.join(solutionsDir, `year${year}`);
  const dayDir = path.join(yearDir, `day${day}`);
  const partDir = path.join(dayDir, `part${part}`);

  return {
    input: path.join(partDir, 'input.txt'),
    puzzle: path.join(partDir, 'puzzle.md'),
    screenshot: path.join(partDir, 'puzzle.png'),
    test: path.join(partDir, 'test.js'),
    solution: path.join(partDir, 'solution.js'),
    solve: path.join(partDir, 'solve.js'),
    output: path.join(partDir, 'output.txt')
  };
}

// Tools object containing all tool functions
export const useTools = {
  create_test: (input) => {
    if (!input?.test_js) {
      throw new Error('No test_js data provided');
    }
    const paths = getFilePaths(input.day || 1, input.part || 1, input.year || 2024);
    writeFile(paths.test, input.test_js);
  },

  create_solution: (input) => {
    if (!input?.solution_js) {
      throw new Error('No solution_js data provided');
    }
    const paths = getFilePaths(input.day || 1, input.part || 1, input.year || 2024);
    writeFile(paths.solution, input.solution_js);
  },

  create_solve: (input) => {
    if (!input?.solve_js) {
      throw new Error('No solve_js data provided');
    }
    const paths = getFilePaths(input.day || 1, input.part || 1, input.year || 2024);
    writeFile(paths.solve, input.solve_js);
  },

  run_test: (input) => {
    console.log(chalk.blue('Running test...'));
    if (input.skip) {
      console.log(chalk.yellow('Skipping test execution'));
      return;
    }
    const paths = getFilePaths(input.day || 1, input.part || 1, input.year || 2024);
    try {
      runCommand(`node --experimental-vm-modules node_modules/jest/bin/jest.js ${paths.test}`, {
        cwd: process.cwd()  // Run from project root where node_modules is
      });
    } catch (error) {
      console.error(chalk.red(`Test failed with error: ${error.message}`));
      process.exit(1);
    }
  },

  run_solve: (input) => {
    console.log(chalk.blue('Running solve...'));
    const paths = getFilePaths(input.day || 1, input.part || 1, input.year || 2024);
    const solveDir = path.dirname(paths.solve);
    process.chdir(solveDir);  // Change to solve directory for relative paths
    try {
      runCommand(`node ${path.basename(paths.solve)}`, {
        cwd: solveDir
      });
    } catch (error) {
      console.error(chalk.red(`Solve failed with error: ${error.message}`));
      process.exit(1);
    }
  }
};

export default useTools;
