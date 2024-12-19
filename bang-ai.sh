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

# Function to wait until a specific time
wait_until_time() {
  target_time="14:00"
  echo "Waiting until $target_time..."
  while [ "$(date +%H:%M)" != "$target_time" ]; do
    sleep 1
  done
  echo "It's $target_time! Starting the script..."
}

# Function to run a command until it succeeds
run_until_success() {
  local cmd=$1
  local retries=0
  local max_retries=10  # Set a maximum number of retries to avoid infinite loops

  while ! eval "$cmd"; do
    retries=$((retries + 1))
    echo "Command failed: $cmd. Retrying... ($retries/$max_retries)"
    if [ $retries -ge $max_retries ]; then
      echo "Exceeded maximum retries. Exiting with failure."
      exit 1
    fi
    sleep 2  # Optional: wait 2 seconds before retrying
  done
}

# Wait until 14:00
wait_until_time

# Run the AI script with the provided arguments
run_until_success "node ai.js --day '$day' --part 1 --year '$year'"
run_until_success "node ai.js --day '$day' --part 2 --year '$year'"

echo "Both parts completed successfully!"
