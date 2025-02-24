import { z } from "zod";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "../env/keys.js";
import fs from 'fs/promises';
import path from 'path';

/**
 * Architect tool
 *   - Prompts for a task if not provided
 *   - Compiles an XML template with the task and codebase
 *   - Uses OpenAI to generate detailed implementation steps
 *   - Creates a tasks.md file with the steps
 */

export const architectToolName = "architect";
export const architectToolDescription =
  "Analyzes a task description and codebase to generate detailed implementation steps.";

export const ArchitectToolSchema = z.object({
  task: z.string().optional().describe("Description of the task - will prompt if not provided"),
  templatePath: z.string().default("src/cursor-template/template.xml").describe("Path to the template XML file"),
  rulesPath: z.string().default("src/cursor-template/rules.md").describe("Path to the rules markdown file"),
  outputPath: z.string().default(".cursor/tasks.md").describe("Path where tasks.md should be written"),
});

/**
 * Reads and returns the contents of a file
 */
async function readFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error}`);
  }
}

/**
 * Writes content to a file, creating directories if needed
 */
async function writeFile(filePath: string, content: string): Promise<void> {
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
async function compileTemplate(task: string, templatePath: string, rulesPath: string): Promise<string> {
  try {
    // Read the base template
    const templateXml = await readFile(templatePath);
    const rules = await readFile(rulesPath);

    // TODO: Once repomix tool is added, replace this with actual codebase content
    const codebaseContent = "<!-- REPOMIX CODEBASE -->";

    // Replace template sections
    return templateXml
      .replace("<!-- REPOMIX CODEBASE -->", codebaseContent)
      .replace("<!-- TASK DESCRIPTION -->", task)
      .replace("<!-- CURSOR RULES -->", rules);
  } catch (error) {
    throw new Error(`Failed to compile template: ${error}`);
  }
}

export async function runArchitectTool(
  args: z.infer<typeof ArchitectToolSchema>,
) {
  // Instantiate the OpenAI client
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  try {
    // If task not provided, return a prompt message
    if (!args.task) {
      return {
        content: [
          {
            type: "text",
            text: "Please provide a task description.",
          },
        ],
      };
    }

    // Compile the template with all sections
    const compiledTemplate = await compileTemplate(args.task, args.templatePath, args.rulesPath);

    // Generate implementation steps using OpenAI
    const response = await openai.chat.completions.create({
      model: "o3-mini-2025-01-31",
      messages: [
        {
          role: "system",
          content: "You are an expert software architect. Given a task and codebase, outline detailed implementation steps for an AI coding agent.",
        },
        {
          role: "user",
          content: compiledTemplate,
        },
      ],
    });

    // Extract the content from the assistant's message
    const steps = response.choices?.[0]?.message?.content ?? "No response from model.";

    // Write the steps to tasks.md
    await writeFile(args.outputPath, steps);

    return {
      content: [
        {
          type: "text",
          text: `Implementation steps have been written to ${args.outputPath}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message || error}`,
        },
      ],
    };
  }
}
