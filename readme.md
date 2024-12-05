# 🎄 AI-Powered Advent of Code Solution Runner

This project provides an automated solution for solving and submitting Advent of Code puzzles using AI assistance. It includes tools for puzzle extraction, solution generation, and automated submission.

## 🚀 Features

- **Automated Puzzle Solving**: Uses AI to generate solutions for Advent of Code puzzles
- **Smart Submission**: Automatically submits solutions with rate limiting and retry handling
- **Environment Management**: Securely handles authentication through environment variables
- **Efficient Processing**: Uses curl for fast puzzle extraction and submission
- **AI Review**: Validates answers using Claude AI before submission
- **Error Handling**: Robust error handling and retry mechanisms

## 🛠️ Setup

1. Clone the repository
2. Create a `.env` file with your credentials:
   ```env
   cookie=your_aoc_session_cookie
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## 📝 Usage

### Solve and Submit (Recommended)
Use the all-in-one solution script:
```bash
./bang-ai.sh -d <day> -p <part> [-y <year>]
```
This will:
1. Extract the puzzle
2. Generate a solution
3. Submit the answer automatically

### Manual Submission
If you already have a solution:
```bash
./submit.sh -d <day> -p <part> [-y <year>]
```

### Wait for Puzzle Release
To wait until midnight EST and solve:
```bash
./wait_and_run.sh
```

## 📁 Project Structure

```
.
├── ai.js           # AI solution generator
├── bang-ai.sh      # Main execution script
├── submit.sh       # Answer submission script
├── wait_and_run.sh # Midnight timer script
└── solutions/      # Generated solutions
    └── year<YYYY>/
        └── day<DD>/
            └── part<N>/
                └── output.txt
```

## 🔧 Components

### AI Solution Generator (ai.js)
- Uses Claude AI to analyze puzzles and generate solutions
- Handles puzzle input parsing and example validation
- Generates clean, efficient Python solutions
- Focuses on the current part's solution

### Submission Handler (submit.sh)
- Submits answers via curl
- Handles rate limiting
- Provides clear feedback with emojis
- Retries on temporary failures

### Orchestrator (bang-ai.sh)
- Coordinates the solution and submission process
- Handles errors and retries
- Provides status updates

### Timer (wait_and_run.sh)
- Calculates time until midnight EST
- Starts solution process at puzzle release
- Handles date rollover

## 🔒 Security

- Sensitive credentials stored in `.env`
- No hardcoded tokens or cookies
- Secure HTTP requests

## ⚠️ Rate Limiting

The system respects Advent of Code's rate limits:
- Waits 60 seconds between submission attempts
- Retries automatically when rate limited
- Provides clear feedback during waiting periods

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📜 License

MIT License - feel free to use and modify!