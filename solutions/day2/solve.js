import fs from 'fs';
import solution from './solution.js';

const input = fs.readFileSync('input.txt', 'utf-8');

// Parse input into array of strings, removing any empty lines
const reports = input.trim().split('\n').filter(line => line.length > 0);

const result = solution(reports);

fs.writeFileSync('output.txt', String(result));