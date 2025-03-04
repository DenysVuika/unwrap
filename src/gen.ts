import { input, number } from '@inquirer/prompts';
import { join, relative } from 'node:path';
import { type TemplateConfig } from './types';
import type { Eta } from 'eta';

/**
 * Collects input values for a given template configuration.
 */
export async function collectInputValues(config: TemplateConfig) {
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

/**
 * Returns true if the files in the template configuration do not already exist in the current directory.
 */
export async function validateFiles(
  config: TemplateConfig,
  eta: Eta,
  data: any
) {
  const currentDir = process.cwd();

  for (const file of config.files) {
    const filePath = eta.renderString(file.path, data);
    const outputPath = join(currentDir, filePath);
    const fileExists = await Bun.file(outputPath).exists();

    if (fileExists) {
      console.log(`File already exists: ${file.path}`);
      return false;
    }
  }

  return true;
}

/**
 * Generates files from a given template configuration.
 */
export async function generateFiles(
  config: TemplateConfig,
  eta: Eta,
  data?: any,
  dryRun?: boolean
) {
  const currentDir = process.cwd();
  const files = config.files || [];

  for (const file of files) {
    const outputContent = eta.render(file.template, data);
    const filePath = eta.renderString(file.path, data);
    const outputPath = join(currentDir, filePath);
    const relativePath = relative(currentDir, outputPath);

    console.log(`Writing file: ${relativePath}`);

    if (dryRun) {
      console.log(outputContent);
      continue;
    }

    await Bun.write(outputPath, outputContent, { createPath: true });
  }
}
