/**
 * 1. PURPOSE: Defines git-related commands as tools for the LLM.
 * 2. ROLE IN THE FLOW: Imported by src/tools/registry.ts to be aggregated into the global toolset.
 * 3. STEP-BY-STEP LOGIC:
 *    - Export `gitTools` array containing ToolDefinitions.
 *    - Include definitions for `git_status`, `git_diff`, `git_commit_and_push`, `git_pull`, `git_create_branch`.
 * 4. INPUTS & OUTPUTS: Exports `gitTools` array of ToolDefinition objects.
 * 5. EDGE CASES TO HANDLE: N/A for array definition itself.
 * 6. SAMPLE CASE: Array contains object with name "git_status".
 */
import type { ToolDefinition } from "../types.js";

/**
 * 1. PURPOSE: Escapes string arguments so they are safe to use in a bash shell command.
 * 2. ROLE IN THE FLOW: Used by git tools (e.g. commit message, branch name) to avoid command injection.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Wrap the input string in single quotes.
 *    2. Escape any embedded single quotes properly for shell evaluation.
 * 4. INPUTS & OUTPUTS: Input: string. Output: safely escaped string.
 * 5. EDGE CASES TO HANDLE: String containing single quotes (e.g., "fix user's bug") must not break out of quotes.
 * 6. SAMPLE CASE: Input `fix'bug` -> Output `'fix'\''bug'`.
 */
function escapeForShell(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

export const gitTools: ToolDefinition[] = [
  //List of git tools
  {
    name: "git_status",
    description: "Shows the working tree status of the current git repository.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    safety: "auto",
    resolve: () => "git status",
  },

  {
    name: "git_diff",
    description: "Shows unstaged or staged changes in the repository.",
    parameters: {
      type: "object",
      properties: {
        staged: {
          type: "string",
          description: "Pass 'true' to show staged changes. Omit for unstaged.",
        },
      },
      required: [],
    },
    safety: "auto",
    resolve: (args) =>
      args.staged === "true" ? "git diff --staged" : "git diff",
  },

  {
    name: "git_commit_and_push",
    description: "Stages all changes, commits with a message, and pushes to the current branch.",
    parameters: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The commit message.",
        },
      },
      required: ["message"],
    },
    safety: "confirm",
    resolve: (args) =>
      `git add -A && git commit -m ${escapeForShell(args.message as string)} && git push`,
  },

  {
    name: "git_pull",
    description: "Pulls the latest changes from the remote for the current branch.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    safety: "auto",
    resolve: () => "git pull",
  },

  {
    name: "git_create_branch",
    description: "Creates and switches to a new git branch.",
    parameters: {
      type: "object",
      properties: {
        branch_name: {
          type: "string",
          description: "The name of the new branch to create.",
        },
      },
      required: ["branch_name"],
    },
    safety: "confirm",
    resolve: (args) =>
      `git checkout -b ${escapeForShell(args.branch_name as string)}`,
  },
];


// temporary test — delete after
console.log(escapeForShell("fix user's bug"));
// expected: 'fix user'\''s bug'

console.log(gitTools.map(t => t.name));
// expected: [ 'git_status', 'git_diff', 'git_commit_and_push', 'git_pull', 'git_create_branch' ]

const statusCmd = gitTools[0].resolve({}, { cwd: process.cwd() } as any);
console.log(statusCmd);
// expected: git status

const commitCmd = gitTools[2].resolve(
  { message: "fix user's bug" },
  { cwd: process.cwd() } as any
);
console.log(commitCmd);
// expected: git add -A && git commit -m 'fix user'\''s bug' && git push