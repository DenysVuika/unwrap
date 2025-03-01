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
import { join } from 'node:path';
import { readdir, exists } from 'node:fs/promises';
import { Eta } from 'eta';
import { EmptyTemplateConfig, type TemplateConfig } from './types';

async function getCustomLicenseTemplates() {
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
        description: 'Custom license template',
      };
    });

  return templateChoices;
}

async function pickLicenseTemplate(): Promise<string> {
  const templatesRoot = join(import.meta.dir, 'templates', 'license');
  const folders = await readdir(templatesRoot, { withFileTypes: true });
  const templateChoices = folders
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      return {
        name: entry.name,
        value: `${templatesRoot}/${entry.name}`,
        description: 'License template',
      };
    });

  const customTemplates = await getCustomLicenseTemplates();
  const choices: any[] = [...templateChoices];

  if (customTemplates.length > 0) {
    choices.push(new Separator());
    choices.push(...customTemplates);
  }

  const answer = await select<string>({
    message: 'Select a license template',
    choices,
  });

  return answer;
}

export async function license(argv: any) {
  const { dryRun } = argv;

  const outputFile = join(process.cwd(), 'LICENSE');
  const licenseExists = await exists(outputFile);
  if (licenseExists) {
    console.log('LICENSE file already exists');
    return;
  }

  const templateRoot = await pickLicenseTemplate();
  if (!templateRoot) {
    console.log('No license template selected');
    return;
  }

  const config = await getTemplateConfig(templateRoot);
  const data: any = await collectInputValues(config);

  const eta = new Eta({ views: templateRoot });
  const outputContent = eta.render('LICENSE', data);

  if (dryRun) {
    console.log(outputContent);
  } else {
    console.log('Writing LICENSE file');
    await Bun.write(outputFile, outputContent);
  }
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
