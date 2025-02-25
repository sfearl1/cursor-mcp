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
});

type InitCursorToolInput = z.infer<typeof InitCursorToolSchema>;

/**
 * Recursively copies files from source to destination directory
 */
async function copyRecursive(src: string, dest: string): Promise<void> {
  const stats = await fs.stat(src);
  
  if (stats.isDirectory()) {
    // Skip the agent-templates directory
    if (path.basename(src) === 'agent-templates') {
      return;
    }
    
    // Create destination directory if it doesn't exist
    await fs.mkdir(dest, { recursive: true });
    
    // Read source directory contents
    const entries = await fs.readdir(src);
    
    // Recursively copy each entry
    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      await copyRecursive(srcPath, destPath);
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
    const { destinationPath } = InitCursorToolSchema.parse(input);
    
    // Ensure template exists in build directory
    const buildTemplateDir = await ensureBuildTemplate();
    
    // Create the .cursor directory path
    const destDir = path.join(destinationPath, '.cursor');
    
    // Copy template files recursively from build to destination
    await copyRecursive(buildTemplateDir, destDir);
    
    return {
      content: [{
        type: 'text',
        text: `Successfully initialized cursor-template at ${destDir}`
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