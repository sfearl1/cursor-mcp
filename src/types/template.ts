// Core template sections
export interface TemplateSection {
  codebase: string;
  task: string;
  rules: string;
  instructions: string;
  prompt: string;
}

// Tool-specific configurations
export interface ToolConfig {
  name: string;
  description: string;
  prompt: string;
  instructions: string;
}

// Shared configurations
export interface SharedConfig {
  rules: string;
}

// Template builder options
export type ToolName = 'architect' | 'designer';

// Compilation result
export interface CompiledTemplate {
  xml: string;
  config: ToolConfig;
} 