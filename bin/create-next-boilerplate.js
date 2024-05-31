#!/usr/bin/env node

import inquirer from 'inquirer';
import simpleGit from 'simple-git';
import { execa } from 'execa';
import path from 'path';
import fs, { rmSync } from 'fs';

const REPO_URL = 'https://github.com/siyeol97/nextjs-boilerplate.git';

async function promptProjectName() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is your project name?',
      validate: (input) => (input ? true : 'Project name cannot be empty'),
    },
  ]);
  return answers.projectName;
}

async function cloneRepo(projectName) {
  const targetDir = path.join(process.cwd(), projectName);
  const git = simpleGit();

  if (fs.existsSync(targetDir)) {
    console.error(
      'Target directory already exists. Please remove it or choose a different project name.'
    );
    process.exit(1);
  }

  console.log('Cloning repository...');
  await git.clone(REPO_URL, targetDir);
  console.log('Repository cloned.');

  const gitDir = path.join(targetDir, '.git');
  rmSync(gitDir, { recursive: true, force: true });
  console.log('.git directory removed.');

  const packageJsonPath = path.join(targetDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  packageJson.name = projectName;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log('Installing packages...');
  await execa('npm', ['install'], { cwd: targetDir, stdio: 'inherit' });
  console.log('Packages installed.');
}

async function main() {
  try {
    const projectName = await promptProjectName();
    await cloneRepo(projectName);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
