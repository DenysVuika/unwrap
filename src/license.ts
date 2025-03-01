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

import { select, Separator } from '@inquirer/prompts';
import { join } from 'node:path';
import { readdir, exists } from 'node:fs/promises';
import { Eta } from 'eta';
import {
  collectInputValues,
  generateFiles,
  getTemplateConfig,
  validateFiles,
} from './gen';

async function getCustomTemplates(key: string) {
  if (!key) {
    return [];
  }

  const templatesRoot = join(process.cwd(), '.unwrap', 'templates', key);
  const dirExists = await exists(templatesRoot);

  if (!dirExists) {
    return [];
  }

  const folders = await readdir(templatesRoot, { withFileTypes: true });
  const templateChoices = folders
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      return {
        name: entry.name,
        value: `${templatesRoot}/${entry.name}`,
        // TODO: get description from the config file
        description: 'Custom template',
      };
    });

  return templateChoices;
}

async function pickTemplate(key: string): Promise<string> {
  if (!key) {
    return '';
  }

  const templatesRoot = join(import.meta.dir, 'templates', key);
  const folders = await readdir(templatesRoot, { withFileTypes: true });
  const templateChoices = folders
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      return {
        name: entry.name,
        value: `${templatesRoot}/${entry.name}`,
        description: 'Default template',
      };
    });

  const customTemplates = await getCustomTemplates(key);
  const choices: any[] = [...templateChoices];

  if (customTemplates.length > 0) {
    choices.push(new Separator());
    choices.push(...customTemplates);
  }

  const answer = await select<string>({
    message: 'Pick a template',
    choices,
  });

  return answer;
}

export async function license(argv: any) {
  const { dryRun } = argv;

  const templateRoot = await pickTemplate('license');
  if (!templateRoot) {
    console.log('No template selected');
    return;
  }

  const config = await getTemplateConfig(templateRoot);

  if (!config) {
    console.log('No config found');
    return;
  }

  const validFiles = await validateFiles(config);
  if (!validFiles) {
    console.log('Operation aborted');
    return;
  }

  const data: any = await collectInputValues(config);
  const eta = new Eta({ views: templateRoot });

  await generateFiles(config, eta, data, dryRun);
}
