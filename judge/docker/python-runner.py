#!/usr/bin/env python3
"""
Python code execution runner for the judge system.
Handles secure execution of user-submitted Python code with test cases.
"""

import sys
import json
import subprocess
import time
import signal
import os
import tempfile
from typing import Dict, Any

class TimeoutError(Exception):
    pass

def timeout_handler(signum, frame):
    raise TimeoutError("Execution timed out")

def execute_python_code(source_code: str, test_input: str, time_limit_ms: int) -> Dict[str, Any]:
    """
    Execute Python code with given input and return results.
    """
    result = {
        "exitCode": 1,
        "stdout": "",
        "stderr": "",
        "runtimeMs": 0,
        "killed": False
    }
    
    start_time = time.time()
    
    try:
        # Set up timeout
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(time_limit_ms // 1000)  # Convert to seconds
        
        # Create temporary file for the code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(source_code)
            temp_file = f.name
        
        try:
            # Execute the code with input
            process = subprocess.Popen(
                [sys.executable, temp_file],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd='/tmp'  # Run in /tmp for security
            )
            
            stdout, stderr = process.communicate(input=test_input, timeout=time_limit_ms/1000)
            
            result["exitCode"] = process.returncode
            result["stdout"] = stdout.strip()
            result["stderr"] = stderr.strip()
            
        except subprocess.TimeoutExpired:
            process.kill()
            result["killed"] = True
            result["stderr"] = "Execution timed out"
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file)
            except:
                pass
                
    except TimeoutError:
        result["killed"] = True
        result["stderr"] = "Execution timed out"
    except Exception as e:
        result["stderr"] = f"Execution error: {str(e)}"
    finally:
        signal.alarm(0)  # Cancel timeout
        result["runtimeMs"] = int((time.time() - start_time) * 1000)
    
    return result

def main():
    """
    Main execution function for the Python runner.
    Reads test data from stdin and outputs results to stdout.
    """
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        source_code = input_data.get("sourceCode", "")
        test_input = input_data.get("testInput", "")
        time_limit_ms = input_data.get("timeLimitMs", 5000)
        
        if not source_code:
            print(json.dumps({"error": "No source code provided"}))
            sys.exit(1)
        
        # Execute the code
        result = execute_python_code(source_code, test_input, time_limit_ms)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": f"Runner error: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
