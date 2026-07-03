/**
 * 1. PURPOSE: The core orchestration logic for a single back-and-forth interaction.
 * 2. ROLE IN THE FLOW: Called by `cli.ts` and `repl.ts` to process one request from start to finish.
 * 3. STEP-BY-STEP LOGIC:
 * - Define `runTurn` function that handles LLM call, resolution, blocklisting, confirmation, execution, and logging.
 * 4. INPUTS & OUTPUTS: Exports `runTurn` function.
 * 5. EDGE CASES TO HANDLE: Model hallucinating tools, blocklist rejections, user declining confirmation.
 * 6. SAMPLE CASE: User asks "status" -> runs `git status` -> logs execution.
 */
import chalk from "chalk";
import * as p from "@clack/prompts";
import type {
  ConversationTurn,
  LLMClient,
  ProjectContext,
  HistoryEntry,
} from "./types.js";
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
 * 1. Push user input to history.
 * 2. Call `llm.generate`.
 * 3. If clarification -> print question and push to history.
 * 4. If tool call -> lookup tool in `ALL_TOOLS`.
 * 5. Resolve tool args into a shell command.
 * 6. Run `checkBlocklist`. If blocked, print error and return.
 * 7. If dryRun, stop here.
 * 8. If safety is "confirm", use `@clack/prompts` to ask for `Y/N`. If No, abort.
 * 9. Call `runCommand` to execute the resolved shell command.
 * 10. Log the execution.
 * 11. Push result to history.
 * 4. INPUTS & OUTPUTS: Inputs: llm, context, history, userInput, options. Output: Promise<void>.
 * 5. EDGE CASES TO HANDLE: Validation error during resolve -> print error and abort gracefully.
 * 6. SAMPLE CASE: "Push code" -> Tool resolves -> user confirms -> command runs -> success logged.
 */
export async function runTurn(
  llm: LLMClient,
  context: ProjectContext,
  history: ConversationTurn[],
  userInput: string,
  options: TurnOptions = {},
): Promise<void> {
  const spinner = p.spinner();

  // 1. Push user input to history
  history.push({ role: "user", content: userInput });

  try {
    spinner.start("Analyzing request...");

    // 2. Call llm.generate (Matching Dev A's exact signature)
    const response = await llm.generate(userInput, context, history, ALL_TOOLS);
    spinner.stop("Analysis complete.");

    // 3. If clarification
    if (response.type === "clarification") {
      // Note: Safely handling a minor bug in Dev A's code where 'message' was returned instead of 'question'
      const text =
        (response as any).message ||
        response.question ||
        "I am not sure how to help with that.";
      console.log(chalk.blue("Assistant:"), text);
      history.push({ role: "assistant", content: text });
      return;
    }

    // 4. If tool call -> lookup tool
    const toolName = response.tool;
    const toolArgs = response.args;
    const tool = findTool(toolName);

    if (!tool) {
      console.error(
        chalk.red(
          `Error: The AI attempted to use an unknown tool: ${toolName}`,
        ),
      );
      history.push({
        role: "assistant",
        content: `Error: Tool '${toolName}' not found.`,
      });
      return;
    }

    // 5. Resolve tool args into a shell command
    let command: string;
    try {
      const resolved = resolveCommand(tool, toolArgs, context);
      command = resolved.command;
    } catch (error) {
      if (error instanceof ToolValidationError) {
        console.error(chalk.red(`\nValidation Error:`), error.message);
        history.push({
          role: "assistant",
          content: `Validation failed: ${error.message}`,
        });
        return;
      }
      throw error;
    }

    // 6. Run checkBlocklist
    const isBlocked = checkBlocklist(command);
    if (isBlocked) {
      console.error(
        chalk.red(
          `\nSecurity Block: The command '${command}' is prohibited by the blocklist.`,
        ),
      );
      history.push({
        role: "assistant",
        content: `Execution blocked by security policy: ${command}`,
      });
      return;
    }

    console.log(chalk.cyan(`\nProposed Command: `) + chalk.bold(command));

    // 7. If dryRun, stop here
    if (options.dryRun) {
      console.log(chalk.yellow("Dry run mode enabled. Skipping execution."));
      return;
    }

    // 8. If safety is "confirm", ask for Y/N
    if (tool.safety === "confirm") {
      const isConfirmed = await p.confirm({
        message: `Execute this command?`,
        initialValue: true,
      });

      if (p.isCancel(isConfirmed) || !isConfirmed) {
        console.log(chalk.yellow("Execution aborted by user."));
        history.push({
          role: "assistant",
          content: `User aborted execution of: ${command}`,
        });
        return;
      }
    }

    // 9. Call runCommand (Matching Dev B's signature and inheriting terminal stdout)
    const executionResult = await runCommand(command, context.cwd);

    // 10. Log the execution (Matching Dev A's HistoryEntry type exactly)
    const logEntry: HistoryEntry = {
      timestamp: new Date().toISOString(),
      tool: toolName,
      args: toolArgs,
      command: command,
      exitCode: executionResult.exitCode,
      success: executionResult.success,
    };
    logExecution(logEntry);

    // 11. Push result to history
    const resultMessage = executionResult.success
      ? `Successfully executed: ${command}`
      : `Failed to execute: ${command} (Exit Code: ${executionResult.exitCode})`;

    history.push({
      role: "assistant",
      content: resultMessage,
    });
  } catch (error) {
    spinner.stop("Error occurred.");
    console.error(
      chalk.red("An unexpected error occurred during this turn:"),
      error instanceof Error ? error.message : String(error),
    );
    history.push({
      role: "assistant",
      content: `System Error: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}
