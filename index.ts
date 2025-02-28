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
import { init } from './src/init';

// Define types for known commands
interface CLIArgs {
  _: string[]; // Captures unknown commands
  text?: string;
  [key: string]: unknown; // Allow additional unknown properties
}

// Function to handle unknown commands
const handleUnknownCommand = (args: string[]) => {
  console.log('Unknown command:', args.join(' '));
  // Add your logic here, e.g., forwarding to another handler
};

const argv = yargs(hideBin(process.argv))
  .command<{}>(
    'init',
    'Initialise [unwrap] project in the current directory',
    (yargs) => {},
    (argv) => {
      init();
    }
  )
  .command<{ text: string }>(
    'note <text>',
    'Creates a new note',
    (yargs) => {
      yargs.positional('text', {
        describe: 'The content of the note',
        type: 'string',
        demandOption: true,
      });
    },
    (argv) => {
      console.log('Creating a new note with content:', argv.text);
    }
  )
  .demandCommand(1, 'You need at least one command before moving on')
  .strict(false)
  .help()
  .parseSync() as CLIArgs;

// Handle unknown commands explicitly
if (argv._.length > 0) {
  handleUnknownCommand(argv._);
}
