/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import fs from 'node:fs';
import { version } from '../package.json';

const APP_DATA_DIR = '.unwrap';

export function init() {
  const currentDirectory = process.cwd();
  const appDataPath = `${currentDirectory}/${APP_DATA_DIR}`;

  if (fs.existsSync(appDataPath)) {
    console.log('Project already initialised');
    return;
  }

  fs.mkdirSync(appDataPath);
  updateGitignore(currentDirectory);

  // create the .unwrap.json config file in the .unwrap directory
  const config = generateConfig();
  fs.writeFileSync(
    `${appDataPath}/.unwrap.json`,
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
