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
            "test.js"
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
        "description": "A should run the test after solution.js and test.js are created",
        "input_schema": {
          "type": "object",
          "properties": {},
          "required": []
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