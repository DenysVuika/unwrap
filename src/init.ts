import fs from 'fs';
import { version } from '../package.json';

const APP_DATA_DIR = '.unwrap';

export function init() {
  const currentDirectory = process.cwd();

  if (fs.existsSync(`${currentDirectory}/${APP_DATA_DIR}`)) {
    console.log('Project already initialised');
    return;
  }

  fs.mkdirSync(`${currentDirectory}/${APP_DATA_DIR}`);
  updateGitignore(currentDirectory);

  // create the .unwrap.json config file in the .unwrap directory
  const config = generateConfig();
  fs.writeFileSync(
    `${currentDirectory}/${APP_DATA_DIR}/.unwrap.json`,
    JSON.stringify(config, null, 2)
  );

  console.log('Project initialised');
}

function updateGitignore(currentDirectory: string) {
  const filePath = `${currentDirectory}/.gitignore`;

  if (fs.existsSync(filePath)) {
    const gitignore = fs.readFileSync(filePath, 'utf8');

    if (!gitignore.includes(APP_DATA_DIR)) {
      fs.appendFileSync(filePath, `\n${APP_DATA_DIR}`);
      console.log('.unwrap added to .gitignore');
    }
  } else {
    fs.writeFileSync(filePath, `${APP_DATA_DIR}`);
  }
}

function generateConfig() {
  const config = {
    version,
  };

  return config;
}
