import { Separator, select } from '@inquirer/prompts';
import { join } from 'node:path';
import { readdir, exists } from 'node:fs/promises';
import { Eta } from 'eta';
import {
  collectInputValues,
  generateFiles,
  getTemplateConfig,
  validateFiles,
} from './gen';
import { toKebabCase } from './utils';
import type { CLIArgs } from './types';

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
  if (!(await exists(templatesRoot))) {
    return '';
  }

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

export async function runCommand(cmd: string, argv: CLIArgs) {
  console.log(`Running command... ${cmd}`);
  console.log(`Arguments... ${JSON.stringify(argv, null, 2)}`);

  const { dryRun } = argv;

  const templateRoot = await pickTemplate(cmd);
  if (!templateRoot) {
    console.log(`No template found for '${cmd}'`);
    return;
  }

  const config = await getTemplateConfig(templateRoot);

  if (!config) {
    console.log(
      'Error: Incorrect template configuration for the selected template'
    );
    return;
  }

  const eta = new Eta({ views: templateRoot });
  let data: any = await collectInputValues(config);
  data = { ...data, toKebabCase };

  const validFiles = await validateFiles(config, eta, data);
  if (!validFiles) {
    console.log('Operation aborted');
    return;
  }

  await generateFiles(config, eta, data, dryRun);
}
