/**
 * 1. PURPOSE: Runs the interactive Read-Eval-Print Loop.
 * 2. ROLE IN THE FLOW: Called by `cli.ts` when no direct command arguments are passed.
 * 3. STEP-BY-STEP LOGIC:
 * - Start an infinite loop asking for user input.
 * - Handle exit commands.
 * - Call `runTurn` sequentially.
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
 * 1. Print welcome message.
 * 2. Enter a while(true) loop.
 * 3. Use `@clack/prompts` text input to ask user what to do.
 * 4. If input is cancelled (Ctrl+C) or matches "exit"/"quit", break the loop.
 * 5. Otherwise, pass input to `runTurn`, awaiting its completion.
 * 4. INPUTS & OUTPUTS: Inputs: llm client, initial context. Output: Promise resolving when loop breaks.
 * 5. EDGE CASES TO HANDLE: Empty string input (skip turn).
 * 6. SAMPLE CASE: Enter -> text -> runTurn -> await -> loop again.
 */
export async function startRepl(
  llm: LLMClient,
  context: ProjectContext,
): Promise<void> {
  // 1. Print welcome message
  p.intro(chalk.bgCyan.black(" Interactive REPL Started "));
  p.note("Type 'exit' or 'quit' to end the session.", "Instructions");

  // 2. Enter a while(true) loop
  while (true) {
    // 3. Use @clack/prompts text input
    const input = await p.text({
      message: chalk.green("You:"),
      placeholder: "What would you like to do?",
    });

    // 4. Handle Ctrl+C (Cancellation)
    if (p.isCancel(input)) {
      p.outro(chalk.yellow("Session ended by user. Goodbye!"));
      break;
    }

    const text = (input as string).trim();

    // 4. Handle manual "exit" or "quit" commands
    if (text.toLowerCase() === "exit" || text.toLowerCase() === "quit") {
      p.outro(chalk.yellow("Exiting REPL. Goodbye!"));
      break;
    }

    // 5. Handle empty string input (skip turn)
    if (!text) {
      continue;
    }

    // Pass input to runTurn, awaiting its completion
    try {
      // Note: Assuming runTurn takes (llm, context, text).
      // Adjust the argument order here if your runTurn signature differs.
      await runTurn(llm, context, text);
    } catch (error) {
      p.log.error(
        chalk.red(
          `An error occurred during this turn: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ),
      );
    }
  }
}
