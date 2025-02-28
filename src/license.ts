import { input, number, select, Separator } from '@inquirer/prompts';
import { join } from 'node:path';
import { readdir, exists } from 'node:fs/promises';
import { Eta } from 'eta';

async function pickLicenseTemplate() {
  const templatesRoot = join(import.meta.dir, 'templates', 'license');
  const folders = await readdir(templatesRoot, { withFileTypes: true });
  const templateChoices = folders
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      return {
        name: entry.name,
        value: entry.name,
        description: 'License template',
      };
    });

  const answer = await select({
    message: 'Select a license template',
    choices: templateChoices,
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
  const templateRoot = join(
    import.meta.dir,
    'templates',
    'license',
    licenseTemplate
  );

  const eta = new Eta({ views: templateRoot });
  const outputContent = eta.render('./LICENSE', { name, year });

  if (dryRun) {
    console.log(outputContent);
  } else {
    // write the license file
    console.log('Writing LICENSE file');
    await Bun.write(outputFile, outputContent);
  }
}
