require('dotenv').config();
const puppeteer = require('puppeteer');
const TurndownService = require('turndown');
const fs = require('fs');
const day = 1;

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null
    });
    const page = await browser.newPage();

    // Set the session cookie before any navigation
    await page.setCookie({
      name: 'session',
      value: process.env.cookie.replace(/"/g, ''), // Remove any quotes from the cookie value
      domain: 'adventofcode.com',
      path: '/',
      expires: Math.floor(new Date('2026-01-01').getTime() / 1000),
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    });

    // First fetch the input text
    await page.goto(`https://adventofcode.com/2024/day/${day}/input`, { waitUntil: 'networkidle2' });
    const inputText = await page.$eval('pre', el => el.textContent);
    fs.writeFileSync(`day${day}.input.txt`, inputText);
    console.log(`Input text has been saved to day${day}_input.txt`);

    // Then get the puzzle description
    await page.goto(`https://adventofcode.com/2024/day/${day}`, { waitUntil: 'networkidle2' });
    
    // Wait for the article element to be present
    await page.waitForSelector('article');

    // Extract the article's HTML content
    const articleHTML = await page.$eval('article', el => el.innerHTML);

    // Initialize Turndown service
    const turndownService = new TurndownService();

    // Convert HTML to Markdown
    const markdown = turndownService.turndown(articleHTML);

    // Save the Markdown to a file
    fs.writeFileSync(`day${day}.puzzle.md`, markdown);

    // Take a screenshot after the page loads
    await page.screenshot({ path: 'aoc_page.png', fullPage: true });

    console.log(`Article content has been saved to day${day}.md`);
    await browser.close();
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
})();
