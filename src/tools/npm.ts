/**
 * 1. PURPOSE: Defines npm-related commands as tools for the LLM.
 * 2. ROLE IN THE FLOW: Imported by src/tools/registry.ts to be aggregated into the global toolset.
 * 3. STEP-BY-STEP LOGIC:
 *    - Export `npmTools` array containing ToolDefinitions.
 *    - Include definitions for `list_scripts`, `run_script`, and `install_dependencies`.
 * 4. INPUTS & OUTPUTS: Exports `npmTools` array of ToolDefinition objects.
 * 5. EDGE CASES TO HANDLE: N/A for array definition itself.
 * 6. SAMPLE CASE: Array contains object with name "run_script".
 */
import type { ToolDefinition } from "../types.js";

/**
 * 1. PURPOSE: Detects the appropriate package manager prefix.
 * 2. ROLE IN THE FLOW: Used inside `run_script` tool's resolve function.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Identify the default package manager runner.
 *    2. Return the command string (e.g., "npm run").
 * 4. INPUTS & OUTPUTS: No inputs. Outputs string.
 * 5. EDGE CASES TO HANDLE: No package-lock.json -> default to npm.
 * 6. SAMPLE CASE: Output: "npm run"
 */
function detectPackageManager(): string {
  // TODO: Implement package manager detection
  throw new Error("Not implemented");
}

export const npmTools: ToolDefinition[] = [
  // TODO: Define the list of NPM tools (list_scripts, run_script, install_dependencies)
];
