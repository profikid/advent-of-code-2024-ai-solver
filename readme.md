# Advent of Code 2024 AI Solver 

Automated solution generator for Advent of Code 2024 puzzles using Anthropic's Claude AI. The solver automatically:
- Fetches puzzle input and description from adventofcode.com
- Generates test cases based on puzzle requirements
- Creates and validates solution implementations
- Runs solutions against the actual puzzle input

## Prerequisites

- Node.js (v18 or higher)
- An Anthropic API key
- Advent of Code session cookie

## Setup

1. Clone and install dependencies:
```bash
git clone https://github.com/profikid/advent-of-code-2024-ai-solver.git
cd advent-of-code-2024-ai-solver
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

Add to `.env`:
```
ANTHROPIC_API_KEY=your_anthropic_api_key
cookie=your_aoc_session_cookie
```

To get your session cookie:
1. Log into [Advent of Code](https://adventofcode.com/2024)
2. Open DevTools (F12) → Application → Cookies
3. Copy the 'session' cookie value

## Usage

Start the solver:
```bash
npm start
```

Follow the prompts to:
1. Enter day number (1-25)
2. Select puzzle part (1 or 2)

The solver will:
- Create a `solutions/dayX/partY` directory
- Download puzzle description and input
- Generate test cases and solution
- Run tests to validate
- Execute against puzzle input
- Save the result

## Rate Limiting

The script uses Claude AI which has rate limits:
- If you encounter a "resource_exhausted" error, wait about an hour before trying again
- The error looks like: `Error: resource_exhausted: rate limit exceeded for model`
- Consider spreading out your puzzle solving sessions to avoid hitting limits

## Configuration

### AI Settings
- Model: `claude-3-5-sonnet-20241022`
- Temperature: 0.4 (reduced from 0.8 for more consistent outputs)
- Max tokens: 8192

## Scripts

### bang-ai.sh

Main execution script that orchestrates the entire puzzle-solving workflow:
[example output](https://app.warp.dev/block/ri7wvn4Gsa1TcoXV8pOzBc);

```bash
# Usage
./bang-ai.sh -y <year> -d <day> -p <part>

# Examples
./bang-ai.sh -y 2023 -d 1 -p 2  # Specific puzzle
./bang-ai.sh -d 1 -p 2          # Current year
./bang-ai.sh                    # Interactive mode
```

Features:
- Automatic restart on failures
- Integrated submission handling
- Smart retry logic:
  - 1-second delay after AI crashes
  - 1-minute delay after wrong submissions
- Exits only on successful submission

### submit.js

Automated puzzle answer submission script:

```bash
node submit.js --year <year> --day <day> --part <part>
```

Features:
- Reads answer from `output.txt`
- Authenticates with Advent of Code
- Submits answer automatically
- Takes screenshot of response
- Error handling:
  - Wrong answers trigger restart
  - Rate limiting detection
  - Unexpected responses
- Saves response screenshots as `submit-response.png`

## Project Structure

```
solutions/
  └── dayX/
      └── partY/
          ├── input.txt     # Puzzle input
          ├── puzzle.md     # Puzzle description
          ├── puzzle.png    # Screenshot
          ├── test.js       # Generated tests
          ├── solution.js   # Solution implementation
          ├── solve.js      # Solution runner
          └── output.txt    # Final output
```

## Dependencies

- @anthropic-ai/sdk - Claude AI integration
- puppeteer - Web scraping
- jest - Testing
- chalk, ora - CLI utilities

## License

MIT