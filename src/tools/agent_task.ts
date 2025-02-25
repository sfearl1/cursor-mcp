import { z } from "zod";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "../env/keys.js";
import fs from 'fs/promises';
import { TemplateBuilder } from "../helpers/template-builder.js";
import { AgentType, agentConfigs } from "../types/template.js";
import path from 'path';
import { resolveRoot } from '../paths.js';

/**
 * Agent Task tools
 *   - Prompts for a task if not provided
 *   - Runs repomix to generate codebase content
 *   - Compiles an XML template with the task and codebase
 *   - Uses OpenAI to generate detailed implementation steps
 *   - Creates tasks in the .cursor/tasks/ directory with agent-specific files
 */

export const agentTaskToolName = "agent_task";
export const agentTaskToolDescription =
  "Analyzes a task description and codebase to generate detailed implementation steps.";

export const AgentTaskToolSchema = z.object({
  task: z.string().describe("Task description"),
  code: z.array(z.string()).optional().describe("Array of files to analyze"),
  rules: z.array(z.string()).optional().describe("Array of rules to follow"),
  agent: z.enum(["architect", "designer", "engineer"]).default("architect").describe("Agent type"),
});

type AgentTaskToolInput = z.infer<typeof AgentTaskToolSchema>;

async function processTemplateWithOpenAI(template: string, agent: AgentType): Promise<string> {
  // Instantiate the new OpenAI client
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-2024-04-09",
      messages: [
        {
          role: "system",
          content: agentConfigs[agent].systemPrompt
        },
        {
          role: "user",
          content: template
        }
      ]
    });

    // Extract the content from the assistant's message (if available)
    const assistantMessage = response.choices?.[0]?.message?.content ?? "No response from model.";
    
    if (!assistantMessage || assistantMessage === "No response from model.") {
      throw new Error("Failed to get valid response from OpenAI");
    }

    return assistantMessage;
  } catch (error) {
    // Throw a more specific error that includes the OpenAI error details
    throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function runAgentTaskTool(args: AgentTaskToolInput) {
  try {
    const { task, code, agent } = args;

    // Validate agent type and provide clear error messages
    if (!Object.keys(agentConfigs).includes(agent)) {
      throw new Error(`Invalid agent type: ${agent}. Supported types are: ${Object.keys(agentConfigs).join(', ')}`);
    }

    // Engineer-specific validation
    if (agent === 'engineer' && (!task || task.trim() === '')) {
      throw new Error("Engineer role requires a detailed task description with implementation steps");
    }

    // Initialize template builder
    const builder = new TemplateBuilder();
    
    // Compile template
    const { content: template } = await builder.compile(task, code, undefined, agent);

    // Process template with OpenAI and ensure we get valid content
    const tasks = await processTemplateWithOpenAI(template, agent);
    
    if (!tasks.trim()) {
      throw new Error(`Generated ${agent} tasks content is empty`);
    }

    // Create .cursor directory if it doesn't exist
    const cursorDir = resolveRoot('.cursor');
    await fs.mkdir(cursorDir, { recursive: true });
    
    // Create tasks directory if it doesn't exist
    const tasksDir = path.join(cursorDir, 'tasks');
    await fs.mkdir(tasksDir, { recursive: true });

    // Save tasks to agent-specific file in .cursor/tasks/
    const taskFilename = `${agent}.md`;
    const taskPath = path.join(tasksDir, taskFilename);
    await fs.writeFile(taskPath, tasks);

    // For backward compatibility, also update the legacy tasks.md file
    // with a notice directing users to the agent-specific file
    const legacyTasksPath = path.join(cursorDir, 'tasks.md');
    const redirectNotice = `# Tasks have moved

Tasks for the ${agent} agent are now located in [.cursor/tasks/${taskFilename}](./tasks/${taskFilename})

This file is kept for backward compatibility but will be removed in a future version.`;
    await fs.writeFile(legacyTasksPath, redirectNotice);

    return {
      content: [{
        type: "text",
        text: `Generated ${agent} implementation steps in ${taskPath}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Failed to generate implementation steps: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
} 