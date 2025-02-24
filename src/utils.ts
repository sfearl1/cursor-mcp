import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Runs repomix to generate the codebase content
 */
export async function runRepomix(configPath: string): Promise<string> {
  try {
    const output = execSync(`npx repomix --config ${configPath}`, {
      encoding: 'utf-8',
    });
    return output;
  } catch (error) {
    throw new Error(`Failed to run repomix: ${error}`);
  }
}

/**
 * Writes content to a file, creating directories if needed
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error}`);
  }
}

/**
 * Compiles the XML template with all required sections
 */
export async function compileTemplate(
  task: string,
  templatePath: string,
  rulesPath: string,
  repomixConfigPath: string
): Promise<string> {
  try {
    const templateXml = await fs.readFile(templatePath, 'utf-8');
    const rules = await fs.readFile(rulesPath, 'utf-8');
    const codebaseContent = await runRepomix(repomixConfigPath);

    return templateXml
      .replace("<!-- REPOMIX CODEBASE -->", codebaseContent)
      .replace("<!-- TASK DESCRIPTION -->", task)
      .replace("<!-- CURSOR RULES -->", rules);
  } catch (error) {
    throw new Error(`Failed to compile template: ${error}`);
  }
} 