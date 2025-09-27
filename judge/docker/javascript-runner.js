#!/usr/bin/env node
/**
 * JavaScript code execution runner for the judge system.
 * Handles secure execution of user-submitted JavaScript code with test cases.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

async function executeJavaScriptCode(sourceCode, testInput, timeLimitMs) {
  const result = {
    exitCode: 1,
    stdout: '',
    stderr: '',
    runtimeMs: 0,
    killed: false
  };
  
  const startTime = Date.now();
  let tempFile;
  
  try {
    // Create temporary file for the code
    tempFile = path.join(os.tmpdir(), `code_${Date.now()}.js`);
    fs.writeFileSync(tempFile, sourceCode);
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      result.killed = true;
      result.stderr = 'Execution timed out';
    }, timeLimitMs);
    
    // Execute the code
    const child = spawn('node', [tempFile], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: os.tmpdir()
    });
    
    // Handle process completion
    const processPromise = new Promise((resolve) => {
      child.on('close', (code) => {
        clearTimeout(timeoutId);
        result.exitCode = code;
        resolve();
      });
      
      child.on('error', (error) => {
        clearTimeout(timeoutId);
        result.stderr = `Process error: ${error.message}`;
        resolve();
      });
    });
    
    // Send input to the process
    if (testInput) {
      child.stdin.write(testInput);
      child.stdin.end();
    }
    
    // Collect output
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    // Wait for process to complete
    await processPromise;
    
    result.stdout = stdout.trim();
    result.stderr = stderr.trim();
    
    // Kill process if it's still running
    if (!child.killed) {
      child.kill();
      result.killed = true;
    }
    
  } catch (error) {
    result.stderr = `Execution error: ${error.message}`;
  } finally {
    // Clean up temporary file
    if (tempFile && fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    
    result.runtimeMs = Date.now() - startTime;
  }
  
  return result;
}

async function main() {
  try {
    // Read input from stdin
    let inputData = '';
    process.stdin.on('data', (chunk) => {
      inputData += chunk.toString();
    });
    
    process.stdin.on('end', async () => {
      try {
        const data = JSON.parse(inputData);
        
        const sourceCode = data.sourceCode || '';
        const testInput = data.testInput || '';
        const timeLimitMs = data.timeLimitMs || 5000;
        
        if (!sourceCode) {
          console.log(JSON.stringify({ error: 'No source code provided' }));
          process.exit(1);
        }
        
        // Execute the code
        const result = await executeJavaScriptCode(sourceCode, testInput, timeLimitMs);
        
        // Output result as JSON
        console.log(JSON.stringify(result));
        
      } catch (error) {
        console.log(JSON.stringify({ error: `Runner error: ${error.message}` }));
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.log(JSON.stringify({ error: `Main error: ${error.message}` }));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
