export default [
    {
        "name": "create_test",
        "description": "create the test.js for the puzzle",
        "input_schema": {
          "type": "object",
          "properties": {
            "test_js": {
              "type": "string",
              "description": "The jest test js code"
            }
          },
          "required": [
            "test_js"
          ]
        }
      },
      {
        "name": "create_solution",
        "description": "create the solution for the puzzle",
        "input_schema": {
          "type": "object",
          "properties": {
            "solution_js": {
              "type": "string",
              "description": "javascript code that will solve the puzzle"
            }
          },
          "required": [
            "solution_js"
          ]
        }
      },
      {
        "name": "create_solve",
        "description": "use the solution with the input to create the real puzzle answer",
        "input_schema": {
          "type": "object",
          "properties": {
            "solve_js": {
              "type": "string",
              "description": "javascript code that will create the answer for solve"
            }
          },
          "required": [
            "solve_js"
          ]
        }
      },
      {
        "name": "run_test",
        "description": "Run the test file to verify the solution",
        "input_schema": {
          "type": "object",
          "properties": {
            "day": {
              "type": "number",
              "description": "The day number of the puzzle"
            },
            "part": {
              "type": "number",
              "description": "The part number of the puzzle (1 or 2)"
            },
            "skip": {
              "type": "boolean",
              "description": "If true, skip running the test",
              "default": false
            }
          },
          "required": ["day", "part"]
        }
      },
      {
        "name": "run_solve",
        "description": "should solve the puzzle and return the final answer",
        "input_schema": {
          "type": "object",
          "properties": {},
          "required": []
        }
      }
]