import type { RepomixConfig } from 'repomix';

// Core template sections
export interface TemplateSection {
  name: string;
  content: string;
}

// Tool-specific configurations
export interface ToolConfig {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

// Shared configurations
export interface SharedConfig {
  name: string;
  description: string;
  version: string;
  author: string;
}

// Template builder options
export type ToolName = 'architect' | 'designer';

// Re-export Repomix types
export type { RepomixConfig };

// Compilation result
export interface CompiledTemplate {
  content: string;
  metrics: {
    totalFiles: number;
    totalCharacters: number;
    totalTokens: number;
    fileCharCounts: Record<string, number>;
    fileTokenCounts: Record<string, number>;
    suspiciousFilesResults: Array<{
      path: string;
      reason: string;
    }>;
  };
} 