/**
 * 1. PURPOSE: Contains shared TypeScript definitions and interfaces used across the project.
 * 2. ROLE IN THE FLOW: Central contract definitions. Keeps other files type-safe and decoupled.
 * 3. STEP-BY-STEP LOGIC: N/A (types only).
 * 4. INPUTS & OUTPUTS: Exports various interfaces and types.
 * 5. EDGE CASES TO HANDLE: N/A.
 * 6. SAMPLE CASE: N/A.
 */

// Shared types used across the project.

export type SafetyTier = "auto" | "confirm";

/** JSON-schema-ish parameter definition, matching what Gemini function calling expects. */
export interface ToolParameterSchema {
  type: "object";
  properties: Record<string, { type: string; description?: string }>;
  required?: string[];
}

export interface ProjectContext {
  cwd: string;
  platform: "darwin" | "linux" | "other";
  isGitRepo: boolean;
  gitBranch?: string;
  gitStatusSummary?: string;
  packageJsonScripts?: Record<string, string>;
  hasDocker: boolean;
  runningContainers?: string[];
  customAliases?: Record<string, string>;
}

/** A tool the LLM can choose to call. `resolve` turns validated args into a real shell command. */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameterSchema;
  safety: SafetyTier;
  /** Builds the actual shell command string from validated arguments + current context. */
  resolve: (args: Record<string, unknown>, ctx: ProjectContext) => string;
}

export interface ToolCallResult {
  type: "tool_call";
  tool: string;
  args: Record<string, unknown>;
}

export interface ClarificationResult {
  type: "clarification";
  question: string;
}

export type LLMResult = ToolCallResult | ClarificationResult;

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

export interface LLMClient {
  generate(
    userInput: string,
    context: ProjectContext,
    history: ConversationTurn[],
    tools: ToolDefinition[]
  ): Promise<LLMResult>;
}

export interface HistoryEntry {
  timestamp: string;
  tool: string;
  args: Record<string, unknown>;
  command: string;
  exitCode: number | null;
  success: boolean;
}
