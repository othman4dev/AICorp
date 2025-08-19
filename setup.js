#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Setting up Multi-Agent Dev Team Simulator...\n');

// Step 1: Install dependencies
console.log('📦 Installing dependencies...');
try {
  console.log('   Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: __dirname });
  
  console.log('   Installing backend dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'backend') });
  
  console.log('   Installing frontend dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'frontend') });
  
  console.log('✅ Dependencies installed successfully!\n');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Step 2: Create .env file if it doesn't exist
const envPath = path.join(__dirname, 'backend', '.env');
const envExamplePath = path.join(__dirname, 'backend', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  try {
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log('✅ .env file created! Please update it with your API keys.\n');
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }
} else {
  console.log('ℹ️  .env file already exists.\n');
}

// Step 3: Show next steps
console.log('🎉 Setup complete! Here are your next steps:\n');
console.log('1. Update your .env file in the backend folder with:');
console.log('   - GEMINI_API_KEY (get from https://makersuite.google.com/app/apikey)');
console.log('   - GITHUB_TOKEN (get from https://github.com/settings/tokens)');
console.log('   - GITHUB_REPO_OWNER and GITHUB_REPO_NAME\n');

console.log('2. Start the development servers:');
console.log('   npm run dev\n');

console.log('3. Open your browser to:');
console.log('   Frontend: http://localhost:5173');
console.log('   Backend API: http://localhost:3001\n');

console.log('4. Try chatting with your AI development team!\n');

console.log('📚 For more information, check the README.md file.');
console.log('🐛 Issues? Create a GitHub issue or check the documentation.\n');

console.log('Happy coding! 🎈');
