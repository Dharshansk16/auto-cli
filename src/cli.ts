#!/usr/bin/env node
/**
 * 1. PURPOSE: The main CLI entry point.
 * 2. ROLE IN THE FLOW: This is where the application starts when executed from the terminal.
 * 3. STEP-BY-STEP LOGIC:
 * - Read GEMINI_API_KEY from env.
 * - Configure `commander` options and arguments.
 * - Handle the `log` subcommand.
 * - Handle the default action (interactive REPL or single-shot execution).
 * 4. INPUTS & OUTPUTS: Parses `process.argv`.
 * 5. EDGE CASES TO HANDLE: Missing API key.
 * 6. SAMPLE CASE: User runs `aiagent log` -> prints history. User runs `aiagent` -> starts REPL.
 */
import "dotenv/config";
import { Command } from "commander";
import chalk from "chalk";
import { GeminiClient } from "./llm/gemini.js";
import { buildContext } from "./context/detector.js";
import { startRepl } from "./repl.js";
import { runTurn } from "./run-turn.js";
import { readHistory } from "./logger/history.js";

/**
 * 1. PURPOSE: Validates presence of the Gemini API key.
 * 2. ROLE IN THE FLOW: Fails fast before the LLM is instantiated.
 * 3. STEP-BY-STEP LOGIC:
 * 1. Read `process.env.GEMINI_API_KEY`.
 * 2. If missing, print error to stderr and `process.exit(1)`.
 * 3. Return the key.
 * 4. INPUTS & OUTPUTS: Returns string.
 * 5. EDGE CASES TO HANDLE: Empty string -> treat as missing.
 * 6. SAMPLE CASE: Missing key -> exits process with error message.
 */
function requireApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    console.error(
      chalk.red(
        "Error: GEMINI_API_KEY environment variable is missing or empty.",
      ),
    );
    console.error(
      chalk.yellow(
        "Please set it in your .env file or export it in your terminal.",
      ),
    );
    process.exit(1);
  }

  return apiKey;
}

const program = new Command();

// Configure the `commander` program (name, description, version).
program
  .name("aiagent")
  .description("A local CLI AI Agent powered by Gemini")
  .version("1.0.0");

// Define the `log` subcommand to read and print history.
program
  .command("log")
  .description("Print the conversation history")
  .action(async () => {
    try {
      const history = await readHistory();
      if (!history || history.length === 0) {
        console.log(chalk.gray("No conversation history found."));
        return;
      }

      console.log(chalk.cyan("\n=== Conversation History ===\n"));

      history.forEach((entry, index) => {
        // Customize these property names based on what is actually in your HistoryEntry type
        const isUser = entry.role === "user";

        if (isUser) {
          console.log(chalk.green(`You:`), entry.content);
        } else {
          console.log(chalk.blue(`AI:`), entry.content);
        }
        console.log(chalk.gray("---------------------------"));
      });
    } catch (error) {
      console.error(
        chalk.red("Failed to read history:"),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });

// Define the main argument parsing logic to either `runTurn` or `startRepl`.
program
  .argument("[prompt...]", "Optional prompt for a single-shot execution")
  .action(async (promptArgs: string[]) => {
    // 1. Validate API Key before doing any heavy lifting
    const apiKey = requireApiKey();

    try {
      // 2. Initialize dependencies
      const llm = new GeminiClient(apiKey);
      const context = await buildContext();

      // 3. Route logic based on arguments
      if (promptArgs && promptArgs.length > 0) {
        // Single-shot execution (e.g., `aiagent what is my current directory?`)
        const text = promptArgs.join(" ");
        await runTurn(llm, context, text);
      } else {
        // Interactive REPL (e.g., `aiagent`)
        await startRepl(llm, context);
      }
    } catch (error) {
      console.error(
        chalk.red("Fatal error during execution:"),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });

// Call `program.parseAsync(process.argv)`.
program.parseAsync(process.argv).catch((error) => {
  console.error(chalk.red("An unexpected error occurred:"), error);
  process.exit(1);
});
