import { ToolConfig, SharedConfig } from '../types/template.js';

export const architectConfig: ToolConfig = {
  name: 'architect',
  description: 'Analyzes a task description and codebase to generate detailed implementation steps',
  prompt: `You are an expert software architect. Given a task and codebase, outline detailed implementation steps for an AI coding agent.`,
  instructions: `Use the <CODEBASE> code as reference, and convert the high-level <TASK> into a set of very detailed step-by-step instructions that an AI coding agent can complete. This could be very long, that's okay. Be comprehensive about the changes that need to be made. Be very specific about the file names.

1. Analyze the requested changes and break them down into clear, actionable steps
2. Create a detailed implementation plan that includes:
- Files that need to be modified
- Specific code sections requiring changes
- New functions, methods, or classes to be added
- Dependencies or imports to be updated
- Data structure modifications
- Interface changes
- Configuration updates

3. For each change:
- Describe the exact location in the code where changes are needed
- Explain the logic and reasoning behind each modification
- Full code is not needed, but provide example signatures, parameters, and return types if necessary
- Note any potential side effects or impacts on other parts of the codebase
- Highlight critical architectural decisions that need to be made

4. Important notes:
- You may include short code snippets to illustrate specific patterns, signatures, or structures, but do not implement the full solution in your outline.
- Focus solely on the technical implementation plan - exclude testing, validation, and deployment considerations unless they directly impact the architecture.
- Only includes steps an AI coding agent can take. 
- Do not include testing or any other work a human would do to confirm the task has been completed. 
- ALWAYS have the agent run a build when it is complete. 
- Be specific and decisive about what the agent should do. 
- Do not include any additional meta instructions to the user. 
- Use markdown formatting.`
};

export const sharedConfig: SharedConfig = {
  rules: `## Components, Naming, & Directories

- Use functional components with "use client" if needed.
- Name in PascalCase under src/components/.
- Keep them small, typed with interfaces.
- Reusable logic in src/utils/shared.ts or src/utils/server.ts.
- Use tsx scripts for migrations.

## TypeScript & Syntax

- Strict mode. Avoid any.
- Use optional chaining, union types (no enums).

## File & Folder Names

- Names in kebab-case (e.g. src/components/my-component.tsx).
- Shared types in src/lib/types.ts.
- Sort imports (external → internal → sibling → styles).

## Icons

- Prefer lucide-react; name icons in PascalCase.
- Custom icons in src/components/icons.

## Tailwind Usage

- Use v4 of Tailwind CSS (no more tailwind.config.ts). Mobile-first, dark mode with dark:(class). 
- Extend brand tokens in globals.css.
- Use Tailwind for common UI components like textarea, button, etc. Only use radix or shadcn for complex components in Next.js/React/Preact projects.
- For animations, prefer Motion / Framer Motion.

## Storybook

- Place stories in src/stories with .stories.tsx extension.
- One story file per component, matching component name.
- Use autodocs for automatic documentation.
- Include multiple variants and sizes in stories.
- Test interactive features with actions.
- Use relative imports from component directory.

## Tech Stack Preferences - General

- Use zod for schema validation.
- Use trpc for API calls.
- Use supabase for database.

## Tech Stack Preferences - Vue/Nuxt

- Use pinia setup stores for state management 
- Use composition api instead of options api
- Use <script setup> syntax in components

## Tech Stack Preferences - React/Next.js

- Use zustand for state management
- Use lucide-react for icons
- Use shadcn/ui for components
- Use framer-motion for animations

## Tools / MCP Tools

- When you make a change to the UI, use the screenshot tool to show the changes.
- If the user asks for a complex task to be performed, find any relevant files and call the architect tool to get a plan and show it to the user. Use this plan as guidance for the changes you make, but maintain the existing patterns and structure of the codebase.
- If the user asks for a UI task to be performed, call the designer tool and use the rubric as guidance for the design decisions, but maintain the existing patterns and structure of the codebase.
- After a complex task is performed, use the code_review tool to create a diff and use the diff to conduct a code review of the changes. Use the sequential_thinking tool to reason about the changes to understand them.
- When reading a single file, use the Filesystem MCP Tool read_file. This will allow the agent to read entire files.
- When reading multiple files, use the Filesystem MCP Tool read_multiple_files. This will allow the agent to read entire files simultaneously before processing them.

## Commits

- Use semantic versioning for releases.
- Use conventional commits for commits.
- Keep code short; commits semantic.

## IMPORTANT:

- After all changes are made, ALWAYS build the project with npm run build. Ignore warnings, fix errors.
- Always add a one-sentence summary of changes to .cursor/updates.md file in markdown format at the end of every agent interaction. 
- If you forget, the user can type the command "/done" and you will run the build and update .cursor/updates.md.
- Finally, update git with git add . && git commit -m "...". Don't push.`
}; 