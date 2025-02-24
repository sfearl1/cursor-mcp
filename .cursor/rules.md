# Cursor Rules - General coding rules for AI agents planning and building JS/TS projects (framework agnostic)

## Components & Naming

- Use functional components with `"use client"` if needed.
- Name in PascalCase under `src/components/`.
- Keep them small, typed with interfaces.
- Use Tailwind for common UI components like textarea, button, etc. Never use radix or shadcn.

## Icons

- Prefer `lucide-react`; name icons in PascalCase.
- Custom icons in `src/components/icons`.

## TypeScript & Syntax

- Strict mode. Avoid `any`.
- Use optional chaining, union types (no enums).

## File & Folder Names

- Names in kebab-case (e.g. `src/components/my-component.tsx`).
- Shared types in `src/lib/types.ts`.
- Sort imports (external → internal → sibling → styles).

## Tailwind Usage

- Use Tailwind (mobile-first, dark mode with dark:(class)). Extend brand tokens in `tailwind.config.ts`.
- For animations, prefer Framer Motion.

## AI

- Use `generateChatCompletion` in `src/lib/aiClient.ts` for all AI calls.
- Prefer `O1` model with high reasoning effort for all AI calls.

## Storybook

- Place stories in `src/stories` with `.stories.tsx` extension.
- One story file per component, matching component name.
- Use autodocs for automatic documentation.
- Include multiple variants and sizes in stories.
- Test interactive features with actions.
- Use relative imports from component directory.

## Tools

- When you make a change to the UI, use the `screenshot` tool to show the changes.
- If the user asks for a complex task to be performed, find any relevant files and call the `architect` tool to get a plan and show it to the user. Use this plan as guidance for the changes you make, but maintain the existing patterns and structure of the codebase.
- After a complex task is performed, use the `codeReview` tool create a diff and use the diff to conduct a code review of the changes.

## Additional

- Keep code short; commits semantic.
- Reusable logic in `src/utils/shared.ts` or `src/utils/server.ts`.
- Use `tsx` scripts for migrations.

## IMPORTANT:

- After all changes are made, ALWAYS build the project with `npm run build`. Ignore warnings, fix errors.
- Always add a one-sentence summary of changes to `.cursor/updates.md` file in markdown format at the end of every agent interaction.
- If you forget, the user can type the command "/finish" and you will run the build and update `.cursor/updates.md`.
- Finally, update git with `git add . && git commit -m "..."`. Don't push.