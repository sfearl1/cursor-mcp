import { z } from "zod";
import OpenAI from "openai";
import { OPENAI_API_KEY, ANTHROPIC_API_KEY } from "../env/keys.js";
import fs from 'fs/promises';
import { TemplateBuilder } from "../helpers/template-builder.js";
import { AgentType, agentConfigs } from "../types/template.js";
import path from 'path';
import { resolveRoot } from '../paths.js';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Agent Task tools
 *   - Prompts for a task if not provided
 *   - Runs repomix to generate codebase content
 *   - Compiles an XML template with the task and codebase
 *   - Uses Claude 3.7 to generate detailed implementation steps
 *   - Documents tasks in the .cursor/tasks.md file
 */

export const agentTaskToolName = "agent_task";
export const agentTaskToolDescription =
  "Analyzes a task description and codebase to generate detailed implementation steps.";

export const AgentTaskToolSchema = z.object({
  task: z.string().describe("Task description"),
  code: z.array(z.string()).optional().describe("Array of files to analyze"),
  rules: z.array(z.string()).optional().describe("Array of rules to follow"),
  agent: z.enum(["planner", "designer"]).default("planner").describe("Agent type"),
});

type AgentTaskToolInput = z.infer<typeof AgentTaskToolSchema>;

async function processTemplateWithClaudeOrOpenAI(template: string, agent: AgentType): Promise<string> {
  try {
    // Use Claude 3.7 for task generation
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20240620",
      system: agentConfigs[agent].systemPrompt,
      messages: [
        {
          role: "user",
          content: template
        }
      ],
      max_tokens: 4000
    });

    // Extract the content from Claude's response
    const assistantMessage = response.content.find(block => block.type === 'text')?.text || "No response from Claude model.";
    
    if (!assistantMessage || assistantMessage === "No response from Claude model.") {
      throw new Error("Failed to get valid response from Claude");
    }

    return assistantMessage;
  } catch (error) {
    console.error("Claude API error, falling back to OpenAI:", error);
    
    // Fallback to OpenAI if Claude fails
    try {
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
      });

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
      const assistantMessage = response.choices?.[0]?.message?.content ?? "No response from OpenAI model.";
      
      if (!assistantMessage || assistantMessage === "No response from OpenAI model.") {
        throw new Error("Failed to get valid response from OpenAI");
      }

      return assistantMessage;
    } catch (openaiError) {
      // If both Claude and OpenAI fail, throw a detailed error
      throw new Error(`API error: Claude failed (${error instanceof Error ? error.message : 'Unknown error'}) and OpenAI fallback failed (${openaiError instanceof Error ? openaiError.message : 'Unknown error'})`);
    }
  }
}

export async function runAgentTaskTool(args: AgentTaskToolInput) {
  try {
    const { task, code, agent } = args;

    // Validate agent type and provide clear error messages
    if (!Object.keys(agentConfigs).includes(agent)) {
      throw new Error(`Invalid agent type: ${agent}. Supported types are: ${Object.keys(agentConfigs).join(', ')}`);
    }

    //  -specific validation
    if (!task || task.trim() === '') {
      throw new Error("agent_task requires a detailed task description");
    }

    // Initialize template builder
    const builder = new TemplateBuilder();
    
    // Compile template
    const { content: template } = await builder.compile(task, code, undefined, agent);

    // Process template with Claude 3.7 (with OpenAI fallback) and ensure we get valid content
    const tasks = await processTemplateWithClaudeOrOpenAI(template, agent);
    
    if (!tasks.trim()) {
      throw new Error(`Generated ${agent} tasks content is empty`);
    }

    // Create .cursor directory if it doesn't exist
    const cursorDir = resolveRoot('.cursor');
    await fs.mkdir(cursorDir, { recursive: true });
    
    // Save tasks to tasks.md file in .cursor/
    const tasksPath = path.join(cursorDir, 'tasks.md');
    
    // Add a header for the agent type
    const formattedTasks = `# ${agent.charAt(0).toUpperCase() + agent.slice(1)} Tasks\n\n${tasks}`;
    
    // Check if the file exists and append or create as needed
    try {
      await fs.access(tasksPath);
      // File exists, read its content
      const existingContent = await fs.readFile(tasksPath, 'utf8');
      // Append new tasks with a separator
      await fs.writeFile(tasksPath, `${existingContent}\n\n---\n\n${formattedTasks}`);
    } catch (err) {
      // File doesn't exist, create it
      await fs.writeFile(tasksPath, formattedTasks);
    }

    return {
      content: [{
        type: "text",
        text: `Generated ${agent} implementation steps in .cursor/tasks.md`
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