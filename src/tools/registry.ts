/**
 * 1. PURPOSE: Aggregates all defined tools into a single exported list.
 * 2. ROLE IN THE FLOW: Imported by `run-turn.ts` to pass to the LLM and to find tools to execute.
 * 3. STEP-BY-STEP LOGIC:
 *    - Combine all tools arrays (git, npm, docker, shell) into `ALL_TOOLS`.
 *    - Implement `findTool` to search by tool name.
 * 4. INPUTS & OUTPUTS: Exports `ALL_TOOLS` array. Export function `findTool(name: string) -> ToolDefinition | undefined`.
 * 5. EDGE CASES TO HANDLE: Unknown tool name in `findTool` should return undefined.
 * 6. SAMPLE CASE: findTool("git_status") -> returns the git_status ToolDefinition.
 */
import type { ToolDefinition } from "../types.js";
import { gitTools } from "./git.js";
import { npmTools } from "./npm.js";
import { dockerTools } from "./docker.js";
import { shellTools } from "./shell.js";

export const ALL_TOOLS: ToolDefinition[] = [
  // TODO: Combine gitTools, npmTools, dockerTools, shellTools
];

/**
 * 1. PURPOSE: Finds a tool definition by its exact name.
 * 2. ROLE IN THE FLOW: Called by the orchestrator after the LLM returns a tool_call response.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Search the ALL_TOOLS array for an item where item.name === name.
 *    2. Return the matching item or undefined.
 * 4. INPUTS & OUTPUTS: Input: string (tool name). Output: ToolDefinition | undefined.
 * 5. EDGE CASES TO HANDLE: Name not found -> return undefined.
 * 6. SAMPLE CASE: Input "git_pull" -> Returns git pull ToolDefinition object.
 */
export function findTool(name: string): ToolDefinition | undefined {
  // TODO: Implement lookup logic
  throw new Error("Not implemented");
}
