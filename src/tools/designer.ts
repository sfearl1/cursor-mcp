import { z } from "zod";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "../env/keys.js";

/**
 * Architect tool
 *   - Calls an OpenAI model (o3-mini-01-31-24) to generate a series of steps
 *   - Input: 'task' (description of the task), 'code' (one or more code files concatenated)
 */

export const designerToolName = "designer";
export const designerToolDescription =
  "Analyzes a design rubric and a project description, then outlines steps for an AI design agent.";

export const DesignerToolSchema = z.object({
  rubric: z.string().min(1, "Rubric is required."),
  project: z
    .string()
    .min(1, "Project description is required."),
});

export async function runDesignerTool(
  args: z.infer<typeof DesignerToolSchema>,
) {
  // Instantiate the new OpenAI client
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  const { rubric, project } = args;
  const systemPrompt = `You are an expert software designer. Present the user with a series of steps that an AI design agent should take to complete or improve the design using a design rubric.`;

  // We'll prompt the model with both the task and code
  const userPrompt = `Rubric: ${rubric}\n\nProject:\n${project}\n\nPlease provide a step-by-step plan.`;

  try {
    const response = await openai.chat.completions.create({
      model: "o3-mini-2025-01-31",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    // Extract the content from the assistant's message (if available)
    const assistantMessage =
      response.choices?.[0]?.message?.content ?? "No response from model.";

    return {
      content: [
        {
          type: "text",
          text: assistantMessage,
        },
      ],
    };
  } catch (error: any) {
    // If the request fails, return the error as text
    return {
      content: [
        {
          type: "text",
          text: `OpenAI Error: ${error.message || error}`,
        },
      ],
    };
  }
}
