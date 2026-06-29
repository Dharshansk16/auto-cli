/**
 * 1. PURPOSE: The core orchestration logic for a single back-and-forth interaction.
 * 2. ROLE IN THE FLOW: Called by `cli.ts` and `repl.ts` to process one request from start to finish.
 * 3. STEP-BY-STEP LOGIC:
 *    - Define `runTurn` function that handles LLM call, resolution, blocklisting, confirmation, execution, and logging.
 * 4. INPUTS & OUTPUTS: Exports `runTurn` function.
 * 5. EDGE CASES TO HANDLE: Model hallucinating tools, blocklist rejections, user declining confirmation.
 * 6. SAMPLE CASE: User asks "status" -> runs `git status` -> logs execution.
 */
import chalk from "chalk";
import * as p from "@clack/prompts";
import type { ConversationTurn, LLMClient, ProjectContext } from "./types.js";
import { ALL_TOOLS, findTool } from "./tools/registry.js";
import { resolveCommand, ToolValidationError } from "./executor/resolver.js";
import { checkBlocklist } from "./executor/blocklist.js";
import { runCommand } from "./executor/runner.js";
import { logExecution } from "./logger/history.js";

export interface TurnOptions {
  dryRun?: boolean;
}

/**
 * 1. PURPOSE: Runs one full turn of the agent loop.
 * 2. ROLE IN THE FLOW: Main orchestrator.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Push user input to history.
 *    2. Call `llm.generate`.
 *    3. If clarification -> print question and push to history.
 *    4. If tool call -> lookup tool in `ALL_TOOLS`.
 *    5. Resolve tool args into a shell command.
 *    6. Run `checkBlocklist`. If blocked, print error and return.
 *    7. If dryRun, stop here.
 *    8. If safety is "confirm", use `@clack/prompts` to ask for `Y/N`. If No, abort.
 *    9. Call `runCommand` to execute the resolved shell command.
 *    10. Log the execution.
 *    11. Push result to history.
 * 4. INPUTS & OUTPUTS: Inputs: llm, context, history, userInput, options. Output: Promise<void>.
 * 5. EDGE CASES TO HANDLE: Validation error during resolve -> print error and abort gracefully.
 * 6. SAMPLE CASE: "Push code" -> Tool resolves -> user confirms -> command runs -> success logged.
 */
export async function runTurn(
  llm: LLMClient,
  context: ProjectContext,
  history: ConversationTurn[],
  userInput: string,
  options: TurnOptions = {}
): Promise<void> {
  // TODO: Implement the full orchestration loop
  throw new Error("Not implemented");
}
