#!/usr/bin/env node
/**
 * CLI script for building and testing Docker judge images
 */

import { DockerJudge } from './judge';

async function main() {
  const command = process.argv[2];
  const judge = new DockerJudge();

  try {
    switch (command) {
      case 'build':
        console.log('Building Docker images for all languages...');
        await judge.buildImages();
        console.log('✓ All images built successfully!');
        break;

      case 'test':
        console.log('Testing all language runners...');
        const languages = ['python', 'javascript', 'java'];
        
        for (const lang of languages) {
          console.log(`Testing ${lang} runner...`);
          const success = await judge.testRunner(lang);
          console.log(`${success ? '✓' : '✗'} ${lang} runner ${success ? 'passed' : 'failed'}`);
        }
        break;

      case 'test-single':
        const language = process.argv[3];
        if (!language) {
          console.error('Usage: npm run test-single <language>');
          process.exit(1);
        }
        
        console.log(`Testing ${language} runner...`);
        const success = await judge.testRunner(language);
        console.log(`${success ? '✓' : '✗'} ${language} runner ${success ? 'passed' : 'failed'}`);
        break;

      default:
        console.log('Usage:');
        console.log('  npm run build        - Build all Docker images');
        console.log('  npm run test         - Test all language runners');
        console.log('  npm run test-single  - Test a specific language runner');
        break;
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}