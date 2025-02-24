import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { ServerResult } from "@modelcontextprotocol/sdk/types.js";

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
 * Initializes the cursor-template directory in a new project
 */
export async function runInitCursorTool(input: InitCursorToolInput): Promise<ServerResult> {
  try {
    // Validate input
    const { destinationPath } = InitCursorToolSchema.parse(input);
    
    // Get source template directory path
    const sourceDir = path.resolve(__dirname, '../cursor-template');
    
    // Ensure source directory exists
    await fs.access(sourceDir);
    
    // Copy template files recursively
    await copyRecursive(sourceDir, destinationPath);
    
    return {
      content: [{
        type: 'text',
        text: `Successfully initialized cursor-template at ${destinationPath}`
      }]
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to initialize cursor-template: ${error.message}`);
    }
    throw error;
  }
} 