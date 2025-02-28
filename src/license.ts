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
  const outputFile = join(process.cwd(), 'LICENSE');
  const licenseExists = await exists(outputFile);
  if (licenseExists) {
    console.log('LICENSE file already exists');
    return;
  }

  const dryRun = argv._.includes('--dry-run');

  const name = await input({ message: 'Enter your name', required: true });
  const year = await number({
    message: 'Enter the year',
    default: new Date().getFullYear(),
  });

  const licenseTemplate = await pickLicenseTemplate();
  if (!licenseTemplate) {
    console.log('No license template selected');
    return;
  }

  const eta = new Eta({ views: licenseTemplate });
  const outputContent = eta.render('./LICENSE', { name, year });

  if (dryRun) {
    console.log(outputContent);
  } else {
    // write the license file
    console.log('Writing LICENSE file');
    await Bun.write(outputFile, outputContent);
  }
}
