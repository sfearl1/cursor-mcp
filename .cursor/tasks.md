Below is a detailed, step-by-step checklist outlining the work required to add the new MCP tool, **init_cursor**, which will initialize the contents of the `src/cursor-template` directory in a new project at .cursor/. Follow these instructions exactly:

> It is critical that you do not skip any steps. After you complete each task, update the file to check off any task. Run builds and commits after each task. Continue with each task until you have checked off each one. After each story, do not take a screenshot. If you need more detail about a task, you can gather relevant files and pass the FULL file to the research agent.

---

1. **Create the New Tool File**
   - [ ] Create a new file at `src/tools/init_cursor.ts`.
   - [ ] Define and export the tool name (e.g., `initCursorToolName`) and a concise description (e.g., "Initializes the cursor-template directory in a new project by copying template files").
   - [ ] Implement an asynchronous function `runInitCursorTool` that:
     - Accepts an input schema using Zod (require at least a `destinationPath` field as a string).
     - Uses Node’s filesystem modules (e.g., `fs.promises` and `path`) to recursively copy the contents of the `src/cursor-template` directory from the source (e.g., `src/cursor-template`) to the provided destination path (default to `.cursor/`).
     - Includes error handling and returns a confirmation message upon successful initialization.
   - [ ] At the end of the function, ensure the tool logs or returns a success message indicating that the initialization is complete.

2. **Define the Input Schema for init_cursor**
   - [ ] Within `src/tools/init_cursor.ts`, use Zod to define an input schema (e.g., `InitCursorToolSchema`).
   - [ ] Require at least one property: `"destinationPath"` (a string representing the full path where the template should be copied).
   - [ ] Validate the input using this schema before performing any file operations.

3. **Integrate the Tool into the MCP Server**
   - [ ] Open `src/index.ts`.
   - [ ] In the section where the MCP tools are listed (inside the `server.setRequestHandler(ListToolsRequestSchema, ...)` block), add a new entry for `init_cursor`:
     - Include the tool name (`initCursorToolName`), description, and input schema (document the property `"destinationPath"`).
   - [ ] In the `server.setRequestHandler(CallToolRequestSchema, ...)` switch-case block, add a new case for `"init_cursor"`:
     - Validate the incoming arguments using the newly created `InitCursorToolSchema`.
     - Call the `runInitCursorTool` function with the validated arguments.
     - Return the result as specified by the tool’s contract.

4. **Update Documentation**
   - [ ] Update the `README.md` file:
     - Add a new section or update the Tools list to include documentation for the `init_cursor` tool.
     - Provide a brief description and example usage (specify that it requires a `destinationPath` input).
   - [ ] If applicable, update any internal docs (like a developer or CHANGELOG file) to note the addition of the new tool.

5. **Finalize and Commit Changes**
   - [ ] Run `npm run build` to build the project and ensure there are no errors.
   - [ ] Update `.cursor/updates.md` with a one-sentence summary of the changes made (e.g., "Added the init_cursor tool to initialize the /cursor-template directory in new projects.").
   - [ ] Commit all changes with a semantic commit message (e.g., `git add . && git commit -m "feat: add init_cursor tool for initializing cursor-template directory"`).

Each of these tasks is a single story point. Make sure to check off each task after its completion and run the build after every step as instructed.