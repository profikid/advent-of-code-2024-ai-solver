#!/bin/bash

# Default values
day=""
part=""
year="2024"

# Parse command line arguments
while getopts "d:p:y:" opt; do
  case $opt in
    d) day="$OPTARG"
    ;;
    p) part="$OPTARG"
    ;;
    y) year="$OPTARG"
    ;;
    \?) echo "Invalid option -$OPTARG" >&2
    exit 1
    ;;
  esac
done

while true; do
  # Run the AI script with the provided arguments
  node ai.js --day "$day" --part "$part" --year "$year"
  ai_exit_code=$?
  
  if [ $ai_exit_code -eq 0 ]; then
    echo -e "\n 'ai.js' completed successfully. Submitting answer..."
    
  else
    echo -e "\n 'node ai.js' crashed with exit code $?. Restarting in 1 second..." >&2
    sleep 1
  fi
done
