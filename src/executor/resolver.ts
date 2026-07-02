/**
 * 1. PURPOSE: Validates args and resolves them into a concrete shell string.
 * 2. ROLE IN THE FLOW: Called by `run-turn.ts` after parsing the LLM's tool call.
 * 3. STEP-BY-STEP LOGIC:
 *    - Define a custom error class for validation failures.
 *    - Implement arg validation based on the tool schema.
 *    - Call the tool's `resolve` function.
 * 4. INPUTS & OUTPUTS: Exports functions.
 * 5. EDGE CASES TO HANDLE: Missing required args.
 * 6. SAMPLE CASE: `resolveCommand` returns a `ResolvedCommand` object.
 */
import type { ProjectContext, SafetyTier, ToolDefinition } from "../types.js";

export interface ResolvedCommand {
  command: string;
  safety: SafetyTier;
  toolName: string;
}

export class ToolValidationError extends Error {}

/**
 * 1. PURPOSE: Validates that the provided arguments satisfy the tool's required fields.
 * 2. ROLE IN THE FLOW: Called by `resolveCommand`.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Iterate over `tool.parameters.required` array.
 *    2. If any required key is missing, null, or empty string in `args`, throw ToolValidationError.
 * 4. INPUTS & OUTPUTS: Input: ToolDefinition, Record<string, unknown>. Output: void.
 * 5. EDGE CASES TO HANDLE: No required fields (skip check).
 * 6. SAMPLE CASE: Missing "script_name" -> Throws Error.
 */
export function validateArgs(tool: ToolDefinition, args: Record<string, unknown>): void {
  const required=tool.parameters.required ?? [];
  for(const field of required){
    const value=args[field];
    if(value === undefined || value === null || value==""){
      throw new ToolValidationError(`Missing required argument "${field}" for tool "${tool.name}".`);
    }
  }
}

/**
 * 1. PURPOSE: Orchestrates validation and string building.
 * 2. ROLE IN THE FLOW: Turns abstract args into an executable command.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Call `validateArgs`.
 *    2. Call `tool.resolve(args, ctx)`.
 *    3. Wrap result in `ResolvedCommand` object containing the command string, tool name, and safety tier.
 * 4. INPUTS & OUTPUTS: Inputs: ToolDefinition, args, context. Output: ResolvedCommand.
 * 5. EDGE CASES TO HANDLE: Validation failure -> bubbles error up.
 * 6. SAMPLE CASE: Resolves a valid object.
 */
export function resolveCommand(
  tool: ToolDefinition,
  args: Record<string, unknown>,
  ctx: ProjectContext
): ResolvedCommand {
  validateArgs(tool, args);
  const command= tool.resolve(args,ctx);

  return {
    command,
    safety: tool.safety,
    toolName:tool.name
  }
}


//testing purpose only
// temporary test — delete after

const mockTool: import("../types.js").ToolDefinition = {
  name: "git_commit",
  description: "Commits staged changes",
  safety: "confirm",
  parameters: {
    type: "object",
    properties: {
      message: { type: "string", description: "Commit message" },
    },
    required: ["message"],
  },
  resolve: (args) => `git commit -m "${args.message}"`,
};

const mockCtx = { cwd: process.cwd() } as ProjectContext;

// should resolve cleanly
console.log(resolveCommand(mockTool, { message: "fix: update readme" }, mockCtx));

// should throw ToolValidationError
try {
  resolveCommand(mockTool, {}, mockCtx);
} catch (e) {
  console.log(e instanceof ToolValidationError ? "ToolValidationError caught " : e);
}