        ## Components, Naming, & Directories

        - Use functional components with `"use client"` if needed.
        - Name in PascalCase under `src/components/`.
        - Keep them small, typed with interfaces.
        - Reusable logic in `src/utils/shared.ts` or `src/utils/server.ts`.
        - Use `tsx` scripts for migrations.

        ## TypeScript & Syntax

        - Strict mode. Avoid `any`.
        - Use optional chaining, union types (no enums).

        ## File & Folder Names

        - Names in kebab-case (e.g. `src/components/my-component.tsx`).
        - Shared types in `src/lib/types.ts`.
        - Sort imports (external → internal → sibling → styles).

        ## Icons

        - Prefer `lucide-react`; name icons in PascalCase.
        - Custom icons in `src/components/icons`.

        ## Tailwind Usage

        - Use v4 of Tailwind CSS (no more `tailwind.config.ts`). Mobile-first, dark mode with dark:(class). 
        - Extend brand tokens in `globals.css`.
        - Use Tailwind for common UI components like textarea, button, etc. Only use radix or shadcn for complex components in Next.js/React/Preact projects.
        - For animations, prefer Motion / Framer Motion.

        ## Storybook

        - Place stories in `src/stories` with `.stories.tsx` extension.
        - One story file per component, matching component name.
        - Use autodocs for automatic documentation.
        - Include multiple variants and sizes in stories.
        - Test interactive features with actions.
        - Use relative imports from component directory.

        ## Tech Stack Preferences - General

        - Use `zod` for schema validation.
        - Use `trpc` for API calls.
        - Use `supabase` for database.

        ## Tech Stack Preferences - Vue/Nuxt

        - Use `pinia` `setup stores` for state management 
        - Use `composition api` instead of `options api`
        - Use `<script setup>` syntax in components

        ## Tech Stack Preferences - React/Next.js

        - Use `zustand` for state management
        - Use `lucide-react` for icons
        - Use `shadcn/ui` for components
        - Use `framer-motion` for animations

        ## Tools / MCP Tools

        - When you make a change to the UI, use the `screenshot` tool to show the changes.
        - If the user asks for a complex task to be performed, find any relevant files and call the `agent_task` tool with the "architect" agent type to get a plan and show it to the user. The plan will be saved to `.cursor/tasks/architect.md`. Use this plan as guidance for the changes you make, but maintain the existing patterns and structure of the codebase.
        - If the user asks for a UI task to be performed, call the `agent_task` tool with the "designer" agent type and use the rubric as guidance for the design decisions. The design plan will be saved to `.cursor/tasks/designer.md`. Maintain the existing patterns and structure of the codebase.
        - For thorough implementation of complex tasks, call the `agent_task` tool with the "engineer" agent type to meticulously implement architectural plans or design tasks, track progress, and ensure high-quality code without redundant work. Implementation steps will be saved to `.cursor/tasks/engineer.md`.
        - Tasks from each agent type are stored in separate files in the `.cursor/tasks/` directory to avoid overlap.
        - After a complex task is performed, use the `code_review` tool to create a diff and use the diff to conduct a code review of the changes. Use the `sequential_thinking` tool to reason about the changes to understand them.
        - When reading a single file, use the Filesystem MCP Tool `read_file`. This will allow the agent to read entire files.
        - When reading multiple files, use the Filesystem MCP Tool `read_multiple_files`. This will allow the agent to read entire files simultaneously before processing them.

        ## Commits

        - Use semantic versioning for releases.
        - Use conventional commits for commits.
        - Keep code short; commits semantic.

        ## IMPORTANT:

        - After all changes are made, ALWAYS build the project with `npm run build`. Ignore warnings, fix errors.
        - Always add a one-sentence summary of changes to `.cursor/updates.md` file in markdown format at the end of every agent interaction. 
        - If you forget, the user can type the command "/done" and you will run the build and update `.cursor/updates.md`.
        - Finally, update git with `git add . && git commit -m "..."`. Don't push.