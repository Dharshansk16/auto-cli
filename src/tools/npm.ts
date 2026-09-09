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
import { existsSync } from "node:fs";
import { join } from "node:path";

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
  const cwd= process.cwd();
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  return "npm"; // Default to npm if no lock file is found
}

export const npmTools: ToolDefinition[] = [
  {
    name: "list_scripts",
    description: "Lists all available scripts defined in the project's package.json.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    safety: "auto",
    resolve: () => "cat package.json | grep -A 50 '\"scripts\"'",
  },

  {
    name: "run_script",
    description: "Runs a script defined in package.json using the detected package manager.",
    parameters: {
      type: "object",
      properties: {
        script_name: {
          type: "string",
          description: "The name of the npm script to run (e.g. 'build', 'test', 'dev').",
        },
      },
      required: ["script_name"],
    },
    safety: "confirm",
    resolve: (args) => {
      const script = args.script_name as string;
      const pm = detectPackageManager();
      return pm === "yarn" ? `yarn ${script}` : `${pm} run ${script}`;
    },
  },

  {
    name: "install_dependencies",
    description: "Installs all project dependencies using the detected package manager.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    safety: "confirm",
    resolve: () => {
      const pm = detectPackageManager();
      return pm === "yarn" ? "yarn" : `${pm} install`;
    },
  },
];


