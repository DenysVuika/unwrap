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

export interface CLIArgs {
  _: string[]; // Captures unknown commands
  dryRun?: boolean;
  [key: string]: unknown; // Allow additional unknown properties
}

export interface CommandConfig {
  name: string;
  description: string;
}

export interface TemplateConfig {
  description?: string;
  files: TemplateFile[];
  context: {
    input: TemplateInput;
  };
}

export interface TemplateFile {
  path: string;
  template: string;
}

export interface TemplateInput {
  [key: string]: TemplateInputValue;
}

export interface TemplateInputValue {
  type: InputValueType;
  description: string;
  required: boolean;
}

export type InputValueType = 'string' | 'number';

export const EmptyTemplateConfig: TemplateConfig = {
  files: [],
  context: {
    input: {},
  },
};
