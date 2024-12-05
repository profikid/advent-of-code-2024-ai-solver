#!/bin/bash

# Function to submit answer using curl
submit_answer() {
    local year=$1
    local day=$2
    local part=$3
    local solution_file="solutions/year${year}/day${day}/part${part}/output.txt"
    
    # Check if solution file exists
    if [ ! -f "$solution_file" ]; then
        echo " No solution file found at $solution_file"
        return 1
    fi

    # Read the answer from the solution file
    local answer=$(cat "$solution_file" | tr -d '\n')
    
    # Check if cookie exists in environment
    if [ -z "$cookie" ]; then
        echo " No cookie found in environment variables"
        return 1
    fi

    echo "Submitting answer: $answer"
    
    # Submit the answer using curl
    local response=$(curl -s "https://adventofcode.com/${year}/day/${day}/answer" \
        --cookie "session=${cookie}" \
        --data "level=${part}&answer=${answer}")
    
    # Check the response
    if echo "$response" | grep -q "That's the right answer!"; then
        echo "Correct answer! Puzzle completed!"
        return 0
    elif echo "$response" | grep -q "That's not the right answer"; then
        echo "Wrong answer. Try again."
        return 1
    elif echo "$response" | grep -q "You gave an answer too recently"; then
        echo "You must wait before trying again."
        return 2
    else
        echo "Unexpected response. Check the website."
        return 1
    fi
}

# Default values
day=""
part=""
year="2024"

# Parse command line arguments
while getopts "d:p:y:" opt; do
    case $opt in
        d) day="$OPTARG" ;;
        p) part="$OPTARG" ;;
        y) year="$OPTARG" ;;
        \?) echo "Invalid option -$OPTARG" >&2; exit 1 ;;
    esac
done

# Validate required arguments
if [ -z "$day" ] || [ -z "$part" ]; then
    echo "Usage: $0 -d <day> -p <part> [-y <year>]"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Submit the answer
submit_answer "$year" "$day" "$part"
exit_code=$?

if [ $exit_code -eq 2 ]; then
    # Rate limited - wait and retry
    echo "Waiting 60 seconds before retrying..."
    sleep 60
    submit_answer "$year" "$day" "$part"
    exit_code=$?
fi

exit $exit_code
