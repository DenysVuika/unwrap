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

import { input, number, select, Separator } from '@inquirer/prompts';
import { join, relative } from 'node:path';
import { readdir, exists } from 'node:fs/promises';
import { Eta } from 'eta';
import { EmptyTemplateConfig, type TemplateConfig } from './types';

async function getCustomTemplates() {
  const templatesRoot = join(process.cwd(), '.unwrap', 'templates', 'license');
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

async function pickTemplate(): Promise<string> {
  const templatesRoot = join(import.meta.dir, 'templates', 'license');
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

  const customTemplates = await getCustomTemplates();
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

  const templateRoot = await pickTemplate();
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

async function collectInputValues(config: TemplateConfig) {
  const inputValues: Record<string, any> = {};

  for (const [key, value] of Object.entries(config.context.input)) {
    const { type, description, required } = value;

    if (type === 'string') {
      inputValues[key] = await input({ message: description, required });
    } else if (type === 'number') {
      inputValues[key] = await number({ message: description, required });
    }
  }

  return inputValues;
}

async function getTemplateConfig(
  templateRoot: string
): Promise<TemplateConfig> {
  const configPath = join(templateRoot, 'config.json');
  const configFile = Bun.file(configPath);
  const configExists = await configFile.exists();

  if (!configExists) {
    return EmptyTemplateConfig;
  }

  const configContent = await configFile.text();
  return JSON.parse(configContent);
}

async function validateFiles(config: TemplateConfig) {
  const currentDir = process.cwd();

  for (const file of config.files) {
    // ensure the files are not already existing
    const fileExists = await Bun.file(join(currentDir, file.path)).exists();
    if (fileExists) {
      console.log(`File already exists: ${file.path}`);
      return false;
    }
  }

  return true;
}

async function generateFiles(
  config: TemplateConfig,
  eta: Eta,
  data?: any,
  dryRun?: boolean
) {
  const currentDir = process.cwd();
  const files = config.files || [];

  for (const file of files) {
    const outputContent = eta.render(file.template, data);
    const outputPath = join(currentDir, file.path);
    const relativePath = relative(currentDir, outputPath);

    console.log(`Writing file: ${relativePath}`);

    if (dryRun) {
      console.log(outputContent);
      continue;
    }

    await Bun.write(outputPath, outputContent, { createPath: true });
  }
}
