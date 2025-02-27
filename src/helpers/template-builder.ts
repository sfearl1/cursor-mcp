import { promises as fs } from 'fs';
import path from 'path';
import type { RepomixConfig, CompiledTemplate, AgentType, AgentConfig } from '../types/template.js';
import { agentConfigs } from '../types/template.js';
import { pack } from 'repomix';

export class TemplateBuilder {
  private rootDir: string;

  constructor(rootDir?: string) {
    if (rootDir) {
      // If rootDir is provided, use it directly
      this.rootDir = path.resolve(rootDir);
    } else {
      // Since we're running from build/tools/agent.js, go up three levels
      const buildDir = path.dirname(path.dirname(path.dirname(new URL(import.meta.url).pathname)));
      this.rootDir = buildDir;
      console.error('Resolved rootDir:', this.rootDir);
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  private async runRepomix(files?: string[]): Promise<string> {
    try {
      // Log the current working directory and rootDir for debugging
      console.error('Current rootDir:', this.rootDir);
      console.error('Files to process:', files);

      // If specific files are provided, ensure they exist first
      if (files) {
        for (const file of files) {
          const fullPath = path.join(this.rootDir, file);
          try {
            await fs.access(fullPath);
          } catch (error) {
            throw new Error(`Cannot access file ${fullPath}: ${error}`);
          }
        }
      }

      // Create output path relative to rootDir
      const outputPath = path.join(this.rootDir, 'output.xml');

      console.error('Output path:', outputPath);

      const packOptions = {
        cwd: this.rootDir,
        output: {
          filePath: outputPath,
          style: 'xml' as const,
          parsableStyle: true,
          fileSummary: true,
          directoryStructure: true,
          removeComments: false,
          removeEmptyLines: false,
          compress: false,
          showLineNumbers: false,
          topFilesLength: 100,
          copyToClipboard: false,
          includeEmptyDirectories: false
        },
        include: ['**/*'],
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
          customPatterns: [
            'node_modules',
            '.git',
            'build',
            '.cursor',
            'output.xml'
          ]
        },
        security: {
          enableSecurityCheck: true
        },
        tokenCount: {
          encoding: 'cl100k_base' as const
        }
      };

      const pathsToProcess = files || [this.rootDir];
      const result = await pack(pathsToProcess, packOptions) as { content?: string; files?: Record<string, string> };

      // Handle the result based on its type
      if (typeof result === 'string') {
        return result;
      } else if (result && typeof result === 'object') {
        if ('content' in result && result.content) {
          return result.content;
        } else if ('files' in result && result.files) {
          return JSON.stringify(result.files, null, 2);
        }
      }
      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error('Repomix error details:', error);
      throw new Error(`Failed to run Repomix: ${error}`);
    }
  }

  async compile(task: string, code?: string[], rulesPath?: string, agentType: AgentType = 'planner'): Promise<CompiledTemplate> {
    try {
      // Get codebase content based on input method
      let codebaseContent: string;
      if (code && Array.isArray(code)) {
        // Run repomix on the specific files from Cursor
        codebaseContent = await this.runRepomix(code);
      } else {
        // Generate using repomix on entire directory
        codebaseContent = await this.runRepomix();
      }

      // Extract the actual code content from the XML structure
      const codeMatch = codebaseContent.match(/<files>([\s\S]*)<\/files>/);
      const cleanedCodeContent = codeMatch ? codeMatch[1].trim() : codebaseContent;

      // Get rules content with proper path handling
      let rulesContent: string;
      try {
        // Ensure .cursor directory exists
        const cursorDir = path.join(this.rootDir, '.cursor');
        await this.ensureDirectoryExists(cursorDir);

        // First check for .cursor/rules.md
        const cursorRulesPath = path.join(cursorDir, 'rules.md');
        try {
          const cursorRulesContent = await fs.readFile(cursorRulesPath, 'utf-8');
          if (cursorRulesContent.trim()) {
            rulesContent = cursorRulesContent;
          } else {
            throw new Error('Empty rules file');
          }
        } catch (error) {
          // If .cursor/rules.md doesn't exist or is empty, try user path or default
          if (rulesPath) {
            rulesContent = await fs.readFile(path.resolve(this.rootDir, rulesPath), 'utf-8');
          } else {
            const defaultRulesPath = path.join(this.rootDir, 'src', 'cursor-template', 'rules.md');
            rulesContent = await fs.readFile(defaultRulesPath, 'utf-8');
          }
        }
      } catch (error) {
        throw new Error(`Failed to read rules file: ${error}`);
      }

      const config = agentConfigs[agentType];
      const taskContent = agentType === 'designer' && config.taskTemplate 
        ? config.taskTemplate.replace('{task}', task)
        : task;

      // Build the template with consistent structure
      const template = `<TEMPLATE>
  <CODEBASE>
    ${cleanedCodeContent}
  </CODEBASE>

  <RULES>
    ${rulesContent.split('\n').map(line => line.trim()).join('\n    ')}
  </RULES>

  <TASK>
    ${taskContent}
  </TASK>

  <INSTRUCTIONS>
    ${config.instructions}
  </INSTRUCTIONS>

  <PROMPT>
    ${config.prompt}
  </PROMPT>
</TEMPLATE>`;

      return {
        content: template,
        metrics: {
          totalFiles: 0,
          totalCharacters: template.length,
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