import { execSync } from 'child_process';
import { TemplateSection, ToolConfig, ToolName, CompiledTemplate } from '../types/template.js';
import { baseTemplate } from '../templates/base.js';
import { architectConfig, sharedConfig } from '../templates/configs.js';

/**
 * Runs repomix to generate the codebase content
 */
async function runRepomix(configPath: string): Promise<string> {
  try {
    const output = execSync(`npx repomix --config ${configPath}`, {
      encoding: 'utf-8',
    });
    return output;
  } catch (error) {
    throw new Error(`Failed to run repomix: ${error}`);
  }
}

export class TemplateBuilder {
  private toolConfig: ToolConfig;
  
  constructor(toolName: ToolName) {
    // For now, we only have architect config
    this.toolConfig = toolName === 'architect' ? architectConfig : architectConfig;
  }

  /**
   * Compiles the template with all required sections
   */
  async compile(task: string, repomixConfigPath: string): Promise<CompiledTemplate> {
    try {
      // Generate codebase content using repomix
      const codebaseContent = await runRepomix(repomixConfigPath);

      // Prepare template sections
      const sections: TemplateSection = {
        codebase: codebaseContent,
        task,
        rules: sharedConfig.rules,
        instructions: this.toolConfig.instructions,
        prompt: this.toolConfig.prompt
      };

      // Compile the template
      const xml = baseTemplate(sections);

      return {
        xml,
        config: this.toolConfig
      };
    } catch (error) {
      throw new Error(`Failed to compile template: ${error}`);
    }
  }
} 