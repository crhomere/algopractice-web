#!/usr/bin/env node
/**
 * Test script for the Docker judge system
 */

const testCases = [
  {
    name: 'Python Sum Test',
    language: 'python',
    sourceCode: `n = int(input())
arr = list(map(int, input().split()))
print(sum(arr))`,
    testInput: '5\n1 2 3 4 5',
    expectedOutput: '15'
  },
  {
    name: 'JavaScript Sum Test',
    language: 'javascript',
    sourceCode: `const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let lines = [];
rl.on('line', (line) => {
  lines.push(line);
  if (lines.length === 2) {
    const n = parseInt(lines[0]);
    const arr = lines[1].split(' ').map(Number);
    console.log(arr.reduce((sum, val) => sum + val, 0));
    rl.close();
  }
});`,
    testInput: '5\n1 2 3 4 5',
    expectedOutput: '15'
  },
  {
    name: 'Java Sum Test',
    language: 'java',
    sourceCode: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int sum = 0;
        for (int i = 0; i < n; i++) {
            sum += scanner.nextInt();
        }
        System.out.println(sum);
    }
}`,
    testInput: '5\n1 2 3 4 5',
    expectedOutput: '15'
  }
];

async function testJudge() {
  console.log('Testing Docker Judge System...\n');
  
  for (const testCase of testCases) {
    console.log(`Testing ${testCase.name}...`);
    
    try {
      const response = await fetch('http://localhost:3000/api/judge/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: testCase.language,
          sourceCode: testCase.sourceCode,
          problemId: 'test-problem'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      console.log(`✓ ${testCase.name} completed`);
      console.log(`  Language: ${result.language}`);
      console.log(`  Passed: ${result.passed}`);
      console.log(`  Total Score: ${result.totalScore}/${result.maxScore}`);
      console.log(`  Runtime: ${result.totalRuntimeMs}ms`);
      console.log(`  Results: ${result.results.length} test cases`);
      
      // Show individual test results
      result.results.forEach((testResult) => {
        const status = testResult.passed ? '✓' : '✗';
        console.log(`    ${status} ${testResult.testCaseId}: ${testResult.runtimeMs}ms`);
        if (!testResult.passed && testResult.error) {
          console.log(`      Error: ${testResult.error}`);
        }
      });
      
    } catch (error) {
      console.log(`✗ ${testCase.name} failed: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('Judge testing completed!');
}

// Run tests if this script is executed directly
if (require.main === module) {
  testJudge().catch(console.error);
}

module.exports = { testJudge };