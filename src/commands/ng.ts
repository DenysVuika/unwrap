import { Separator, select } from '@inquirer/prompts';
import { join } from 'node:path';
import { readdir, exists } from 'node:fs/promises';
import { Eta } from 'eta';
import { collectInputValues, generateFiles, getTemplateConfig } from '../gen';
import { toKebabCase } from '../utils';

async function pickTemplate(key: string): Promise<string> {
  if (!key) {
    return '';
  }

  const templatesRoot = join(import.meta.dir, '..', 'templates', key);
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

  const choices: any[] = [...templateChoices];

  const answer = await select<string>({
    message: 'Pick a template',
    choices,
  });

  return answer;
}

export async function ng(argv: any) {
  const { dryRun } = argv;

  const templateRoot = await pickTemplate('ng');
  if (!templateRoot) {
    console.log('No template selected');
    return;
  }

  const config = await getTemplateConfig(templateRoot);

  if (!config) {
    console.log('No config found');
    return;
  }

  let data: any = await collectInputValues(config);
  data = { ...data, toKebabCase };

  const eta = new Eta({ views: templateRoot });
  await generateFiles(config, eta, data, dryRun);
}
