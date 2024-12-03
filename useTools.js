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

function getFilePaths(day) {
  const solutionsDir = path.join(process.cwd(), 'solutions');
  const dayDir = path.join(solutionsDir, `day${day}`);

  return {
    input: path.join(dayDir, 'input.txt'),
    puzzle: path.join(dayDir, 'puzzle.md'),
    screenshot: path.join(dayDir, 'puzzle.png'),
    test: path.join(dayDir, 'test.js'),
    solution: path.join(dayDir, 'solution.js'),
    solve: path.join(dayDir, 'solve.js'),
    output: path.join(dayDir, 'output.txt')
  };
}

// Tools object containing all tool functions
export const useTools = {
  create_test: (input) => {
    if (!input?.test_js) {
      throw new Error('No test_js data provided');
    }
    const paths = getFilePaths(input.day || 1);
    writeFile(paths.test, input.test_js);
  },

  create_solution: (input) => {
    if (!input?.solution_js) {
      throw new Error('No solution_js data provided');
    }
    const paths = getFilePaths(input.day || 1);
    writeFile(paths.solution, input.solution_js);
  },

  create_solve: (input) => {
    if (!input?.solve_js) {
      throw new Error('No solve_js data provided');
    }
    const paths = getFilePaths(input.day || 1);
    writeFile(paths.solve, input.solve_js);
  },

  run_test: (input) => {
    console.log(chalk.blue('Running test...'));
    const paths = getFilePaths(input.day || 1);
    runCommand(`node --experimental-vm-modules node_modules/jest/bin/jest.js ${paths.test}`, {
      cwd: process.cwd()  // Run from project root where node_modules is
    });
  },

  run_solve: (input) => {
    console.log(chalk.blue('Running solve...'));
    const paths = getFilePaths(input.day || 1);
    const solveDir = path.dirname(paths.solve);
    process.chdir(solveDir);  // Change to solve directory for relative paths
    runCommand(`node ${path.basename(paths.solve)}`, {
      cwd: solveDir
    });
  },
};

export default useTools;
