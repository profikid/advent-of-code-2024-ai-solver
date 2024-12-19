I have implemented the solution for Day 14, Part 1. Let me explain the approach:

1. First, I created a test file that includes:
   - The main example from the puzzle
   - Edge cases for empty input
   - A case with a single robot

2. The solution works as follows:
   - Parses the input string to extract robot positions and velocities
   - Simulates movement for exactly 100 seconds
   - For each robot:
     - Updates position using the velocity
     - Handles wrapping around edges using modulo operation
     - Adds width/height before modulo to handle negative positions correctly
   - Counts robots in each quadrant
     - Excludes robots on middle lines (as specified in the puzzle)
     - Multiplies the counts to get the safety factor

3. Key considerations in the code:
   - Proper handling of wrapping around edges
   - Excluding robots on middle lines (x = halfWidth or y = halfHeight)
   - Handling negative positions correctly
   - Default parameters for the actual puzzle dimensions (101×103)

4. The solve.js file:
   - Reads the input file
   - Calls the solution with the actual puzzle input
   - Writes the result to output.txt

The solution handles all the requirements from the puzzle, including:
- The teleporting/wrapping behavior
- The correct counting of robots in quadrants
- Excluding robots on middle lines
- The 100-second simulation period
- The correct puzzle dimensions

The test passes with the example case producing 12 as expected, and the solution should now work with the actual input.