import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import {
  screenshotToolName,
  screenshotToolDescription,
  ScreenshotToolSchema,
  runScreenshotTool,
} from "./tools/screenshot.js";

import {
  architectToolName,
  architectToolDescription,
  ArchitectToolSchema,
  runArchitectTool,
} from "./tools/architect.js";

import {
  codeReviewToolName,
  codeReviewToolDescription,
  CodeReviewToolSchema,
  runCodeReviewTool,
} from "./tools/code_review.js";

import {
  initCursorToolName,
  initCursorToolDescription,
  InitCursorToolSchema,
  runInitCursorTool,
} from "./tools/init_cursor.js";

/**
 * A minimal MCP server providing five Cursor Tools:
 *   1) InitCursor
 *   2) Screenshot
 *   3) Architect
 *   4) Designer
 *   5) CodeReview
 */

// 1. Create an MCP server instance
const server = new Server(
  {
    name: "cursor-tools",
    version: "2.0.1",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// 2. Define the list of tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: screenshotToolName,
        description: screenshotToolDescription,
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "Full URL to screenshot",
            },
            relativePath: {
              type: "string",
              description: "Relative path appended to http://localhost:3000",
            },
            fullPathToScreenshot: {
              type: "string",
              description:
                "Path to where the screenshot file should be saved. This should be a cwd-style full path to the file (not relative to the current working directory) including the file name and extension.",
            },
          },
          required: [],
        },
      },
      {
        name: architectToolName,
        description: architectToolDescription,
        inputSchema: {
          type: "object",
          properties: {
            task: {
              type: "string",
              description: "Description of the task - will prompt if not provided",
            },
            templatePath: {
              type: "string",
              description: "Path to the template XML file",
              default: "src/cursor-template/template.xml",
            },
            rulesPath: {
              type: "string",
              description: "Path to the rules markdown file",
              default: "src/cursor-template/rules.md",
            },
            outputPath: {
              type: "string",
              description: "Path where tasks.md should be written",
              default: ".cursor/tasks.md",
            },
          },
          required: [],
        },
      },
      {
        name: codeReviewToolName,
        description: codeReviewToolDescription,
        inputSchema: {
          type: "object",
          properties: {
            folderPath: {
              type: "string",
              description:
                "Path to the full root directory of the repository to diff against main",
            },
          },
          required: ["folderPath"],
        },
      },
      {
        name: initCursorToolName,
        description: initCursorToolDescription,
        inputSchema: {
          type: "object",
          properties: {
            destinationPath: {
              type: "string",
              description: "Full path where the template should be copied",
            },
          },
          required: ["destinationPath"],
        },
      },
    ],
  };
});

// 3. Implement the tool call logic
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case screenshotToolName: {
      const validated = ScreenshotToolSchema.parse(args);
      return await runScreenshotTool(validated);
    }
    case architectToolName: {
      const validated = ArchitectToolSchema.parse(args);
      return await runArchitectTool(validated);
    }
    case codeReviewToolName: {
      const validated = CodeReviewToolSchema.parse(args);
      return await runCodeReviewTool(validated);
    }
    case initCursorToolName: {
      const validated = InitCursorToolSchema.parse(args);
      return await runInitCursorTool(validated);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// 4. Start the MCP server with a stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Cursor Tools MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
