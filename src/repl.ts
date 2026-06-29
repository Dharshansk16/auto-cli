/**
 * 1. PURPOSE: Runs the interactive Read-Eval-Print Loop.
 * 2. ROLE IN THE FLOW: Called by `cli.ts` when no direct command arguments are passed.
 * 3. STEP-BY-STEP LOGIC:
 *    - Start an infinite loop asking for user input.
 *    - Handle exit commands.
 *    - Call `runTurn` sequentially.
 * 4. INPUTS & OUTPUTS: Exports `startRepl` which returns a Promise<void>.
 * 5. EDGE CASES TO HANDLE: User hits Ctrl+C or types "exit".
 * 6. SAMPLE CASE: User types "hello" -> LLM responds -> loop repeats.
 */
import * as p from "@clack/prompts";
import chalk from "chalk";
import type { ConversationTurn, LLMClient, ProjectContext } from "./types.js";
import { runTurn } from "./run-turn.js";

/**
 * 1. PURPOSE: Start the REPL loop.
 * 2. ROLE IN THE FLOW: Continuous interaction.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Print welcome message.
 *    2. Enter a while(true) loop.
 *    3. Use `@clack/prompts` text input to ask user what to do.
 *    4. If input is cancelled (Ctrl+C) or matches "exit"/"quit", break the loop.
 *    5. Otherwise, pass input to `runTurn`, awaiting its completion.
 * 4. INPUTS & OUTPUTS: Inputs: llm client, initial context. Output: Promise resolving when loop breaks.
 * 5. EDGE CASES TO HANDLE: Empty string input (skip turn).
 * 6. SAMPLE CASE: Enter -> text -> runTurn -> await -> loop again.
 */
export async function startRepl(llm: LLMClient, context: ProjectContext): Promise<void> {
  // TODO: Implement the REPL loop
  throw new Error("Not implemented");
}
