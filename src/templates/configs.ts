import { ToolConfig, SharedConfig } from '../types/template.js';

export const architectConfig: ToolConfig = {
  name: 'architect',
  description: 'Analyzes a task description and codebase to generate detailed implementation steps',
  parameters: {
    task: {
      type: 'string',
      description: 'Description of the task - will prompt if not provided'
    },
    templatePath: {
      type: 'string',
      description: 'Path to the template XML file',
      default: 'src/cursor-template/template.xml'
    },
    rulesPath: {
      type: 'string',
      description: 'Path to the rules markdown file',
      default: 'src/cursor-template/rules.md'
    },
    outputPath: {
      type: 'string',
      description: 'Path where tasks.md should be written',
      default: '.cursor/tasks.md'
    },
    repomixConfigPath: {
      type: 'string',
      description: 'Path to the repomix config file',
      default: 'repomix.config.json'
    }
  }
};

export const sharedConfig: SharedConfig = {
  name: 'cursor-tools',
  description: 'A collection of tools for the Cursor IDE',
  version: '2.0.1',
  author: 'Cursor Team'
}; 