import { baseTemplate } from '../templates/base.js';
import { promises as fs } from 'fs';
import path from 'path';
import type { RepomixConfig, CompiledTemplate, TemplateSection } from '../types/template.js';
import { pack } from 'repomix';

export class TemplateBuilder {
  constructor() {}

  private async runRepomix(rootDir: string, configPath: string): Promise<string> {
    try {
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8')) as RepomixConfig;
      const result = await pack([rootDir], {
        ...config,
        cwd: process.cwd(),
        output: {
          filePath: path.join(process.cwd(), 'output.xml'),
          style: 'xml',
          parsableStyle: true,
          fileSummary: true,
          directoryStructure: true,
          removeComments: false,
          removeEmptyLines: false,
          compress: false,
          topFilesLength: 100,
          showLineNumbers: true,
          copyToClipboard: false
        },
        include: config.include || ['**/*'],
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
          customPatterns: []
        },
        security: {
          enableSecurityCheck: true
        },
        tokenCount: {
          encoding: 'cl100k_base'
        }
      });
      return result.toString();
    } catch (error) {
      throw new Error(`Failed to run Repomix: ${error}`);
    }
  }

  async compile(templatePath: string, configPath: string): Promise<CompiledTemplate> {
    try {
      const content = await this.runRepomix(templatePath, configPath);
      
      // Create template sections
      const sections: TemplateSection[] = [
        {
          name: 'codebase',
          content
        },
        {
          name: 'config',
          content: await fs.readFile(configPath, 'utf-8')
        }
      ];

      return {
        content: baseTemplate(sections),
        metrics: {
          totalFiles: 0, // TODO: Get from result when API is stable
          totalCharacters: 0,
          totalTokens: 0,
          fileCharCounts: {},
          fileTokenCounts: {},
          suspiciousFilesResults: []
        }
      };
    } catch (error) {
      throw new Error(`Failed to compile template: ${error}`);
    }
  }
} 