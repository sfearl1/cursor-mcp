Added the init_cursor tool to initialize the cursor-template directory in new projects, including implementation, integration, and documentation.

Updated architect tool to generate template.xml from the base template by injecting codebase, task, rules, instructions, and prompt.

Updated architect tool to support XML template compilation and task prompting, preparing for integration with the repomix tool.

Added repomix integration to architect tool to automatically generate codebase content for the XML template.

Refactored architect tool to use shared utility functions for file operations and template compilation.

Refactored template compilation to use type-safe template literals and a component-based structure with configuration-driven content.

Updated architect tool to use Repomix library directly instead of CLI, with proper type safety and error handling.
