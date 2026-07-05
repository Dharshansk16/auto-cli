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
  // Defining execute_shell_command tool
  {
    name: "execute_shell_command",
    description:
      "Executes a raw shell command. Use this as a fallback when no specific tool matches the user's request.",
    parameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "The exact shell command to execute.",
        },
      },
      required: ["command"],
    },
    safety: "confirm",
    resolve: (args) => args.command as string,
  },
];


// temporary test — delete after
console.log(shellTools[0].name);
// expected: execute_shell_command

console.log(shellTools[0].resolve({ command: "ls -la" }, {} as any));
// expected: ls -la