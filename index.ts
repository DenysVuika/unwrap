#! /usr/bin/env bun

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

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { init } from './src/commands/init';
import { runCommand, listTemplateCommands } from './src/run';
import type { CLIArgs } from './src/types';

// List of known commands
const knownCommands = ['init'];

async function main() {
  const parser = yargs(hideBin(process.argv))
    .scriptName('unwrap')
    .command<{}>(
      'init',
      'Initialise [unwrap] project in the current directory',
      (yargs) => {},
      (argv) => {
        init();
      }
    )
    .demandCommand(1, 'You need at least one command before moving on')
    .strict(false)
    .help()
    .wrap(null); // Format help output properly

  const commands = await listTemplateCommands();
  for (const { name, description } of commands) {
    parser.command(
      name,
      description,
      (yargs) => {},
      (argv) => {
        runCommand(name, argv as CLIArgs);
      }
    );

    knownCommands.push(name);
  }

  const argv = parser.parseSync() as CLIArgs;
  const command = argv._[0];

  if (command && !knownCommands.includes(command)) {
    runCommand(command, argv);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
