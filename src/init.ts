const APP_DATA_DIR = '.unwrap';

import fs from 'fs';

export function init() {
  const currentDirectory = process.cwd();
  console.log(currentDirectory);

  if (fs.existsSync(`${currentDirectory}/${APP_DATA_DIR}`)) {
    console.log('Project already initialised');
    return;
  }

  fs.mkdirSync(`${currentDirectory}/${APP_DATA_DIR}`);
  console.log('Project initialised');

  // if current directory contains .gitignore, add .unwrap to .gitignore (only if it's not already there)
  if (fs.existsSync(`${currentDirectory}/.gitignore`)) {
    const gitignore = fs.readFileSync(`${currentDirectory}/.gitignore`, 'utf8');
    if (gitignore.includes(APP_DATA_DIR)) {
      console.log('.unwrap already in .gitignore');
      return;
    }
    fs.appendFileSync(`${currentDirectory}/.gitignore`, `\n${APP_DATA_DIR}`);
    console.log('.unwrap added to .gitignore');
  } else {
    // create .gitignore with .unwrap
    fs.writeFileSync(`${currentDirectory}/.gitignore`, `${APP_DATA_DIR}\n`);
  }
}
