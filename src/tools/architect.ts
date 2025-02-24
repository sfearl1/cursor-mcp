import { z } from "zod";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "../env/keys.js";
import { compileTemplate, writeFile } from "../utils.js";

/**
 * Architect tool
 *   - Prompts for a task if not provided
 *   - Runs repomix to generate codebase content
 *   - Compiles an XML template with the task and codebase
 *   - Uses OpenAI to generate detailed implementation steps
 *   - Creates a tasks.md file with the steps
 */

export const architectToolName = "architect";
export const architectToolDescription =
  "Analyzes a task description and codebase to generate detailed implementation steps.";

export const ArchitectToolSchema = z.object({
  task: z.string().min(1, "Task description is required.").describe("Description of the task - will prompt if not provided"),
  templatePath: z.string().default("src/cursor-template/template.xml").describe("Path to the template XML file"),
  rulesPath: z.string().default("src/cursor-template/rules.md").describe("Path to the rules markdown file"),
  outputPath: z.string().default(".cursor/tasks.md").describe("Path where tasks.md should be written"),
  repomixConfigPath: z.string().default("repomix.config.json").describe("Path to the repomix config file"),
  code: z.string().optional().describe("Code to analyze"),
});


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
  const compiledTemplate = await compileTemplate(
    args.task,
    args.templatePath,
    args.rulesPath,
    args.repomixConfigPath
  );

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
