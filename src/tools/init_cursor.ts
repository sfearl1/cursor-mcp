import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { ServerResult } from "@modelcontextprotocol/sdk/types.js";
import { resolveSrc, resolveBuild } from '../paths.js';

// Tool name and description
export const initCursorToolName = 'init_cursor';
export const initCursorToolDescription = 'Initializes the cursor-template directory in a new project by copying template files';

// Input schema definition
export const InitCursorToolSchema = z.object({
  destinationPath: z.string().describe('Full path where the template should be copied'),
  projectDescription: z.string().optional().describe('Project description to populate the project.mdc file'),
});

type InitCursorToolInput = z.infer<typeof InitCursorToolSchema>;

/**
 * Recursively copies files from source to destination directory
 */
async function copyRecursive(src: string, dest: string, isRootLevel = true): Promise<void> {
  const stats = await fs.stat(src);
  const baseName = path.basename(src);
  
  // At root level, only copy rules directory and tasks.md file
  if (isRootLevel) {
    if (baseName !== 'rules' && baseName !== 'tasks.md') {
      return;
    }
  }
  
  if (stats.isDirectory()) {
    // Create destination directory if it doesn't exist
    await fs.mkdir(dest, { recursive: true });
    
    // Read source directory contents
    const entries = await fs.readdir(src);
    
    // Recursively copy each entry
    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      await copyRecursive(srcPath, destPath, false);
    }
  } else {
    // Copy file
    await fs.copyFile(src, dest);
  }
}

/**
 * Ensures the cursor-template exists in the build directory by copying from src if needed
 */
async function ensureBuildTemplate(): Promise<string> {
  const srcTemplateDir = resolveSrc('cursor-template');
  const buildTemplateDir = resolveBuild('cursor-template');
  
  try {
    // Check if build template exists
    await fs.access(buildTemplateDir);
  } catch {
    // If build template doesn't exist, copy from src
    await copyRecursive(srcTemplateDir, buildTemplateDir);
  }
  
  return buildTemplateDir;
}

/**
 * Initializes the cursor-template directory in a new project
 */
export async function runInitCursorTool(input: InitCursorToolInput): Promise<ServerResult> {
  try {
    // Validate input
    const { destinationPath, projectDescription } = InitCursorToolSchema.parse(input);
    
    // Ensure template exists in build directory
    const buildTemplateDir = await ensureBuildTemplate();
    
    // Create the .cursor directory path
    const destDir = path.join(destinationPath, '.cursor');
    
    // Create destination directory if it doesn't exist
    await fs.mkdir(destDir, { recursive: true });
    
    // Copy only the rules directory and tasks.md file
    const rulesDir = path.join(buildTemplateDir, 'rules');
    const destRulesDir = path.join(destDir, 'rules');
    await copyRecursive(rulesDir, destRulesDir, false);
    
    // If project description is provided, update the project.mdc file
    if (projectDescription) {
      const projectMdcPath = path.join(destRulesDir, 'project.mdc');
      try {
        // Read the existing project.mdc file
        const projectMdcContent = await fs.readFile(projectMdcPath, 'utf8');
        
        // Replace the project description in the file
        // We'll look for the content between "# Project Overview" and the first "---" after that
        const updatedContent = projectMdcContent.replace(
          /(# Project Overview\n\n)(.*?)(\n\n---)/s,
          `$1${projectDescription}$3`
        );
        
        // Write the updated content back to the file
        await fs.writeFile(projectMdcPath, updatedContent);
      } catch (error) {
        console.error('Error updating project.mdc:', error);
      }
    }
    
    const tasksFile = path.join(buildTemplateDir, 'tasks.md');
    const destTasksFile = path.join(destDir, 'tasks.md');
    await fs.copyFile(tasksFile, destTasksFile);
    
    // No longer creating tasks directory or placeholder files
    
    return {
      content: [{
        type: 'text',
        text: `Successfully initialized cursor-template at ${destDir} with rules directory and tasks.md file${projectDescription ? ' and customized project description' : ''}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Failed to initialize cursor-template: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
} 