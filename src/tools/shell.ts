/**
 * 1. PURPOSE: Defines the generic fallback shell command tool.
 * 2. ROLE IN THE FLOW: Imported by src/tools/registry.ts. Used by LLM when no specific tool matches the request.
 * 3. STEP-BY-STEP LOGIC:
 *    - Export `shellTools` array.
 *    - Include a single tool `execute_shell_command` with required confirmation safety.
 * 4. INPUTS & OUTPUTS: Exports `shellTools` array of ToolDefinition.
 * 5. EDGE CASES TO HANDLE: N/A.
 * 6. SAMPLE CASE: Array contains object with name "execute_shell_command".
 */
import type { ToolDefinition } from "../types.js";

export const shellTools: ToolDefinition[] = [
  // TODO: Define execute_shell_command tool
];
