#!/usr/bin/env node
/**
 * 1. PURPOSE: The main CLI entry point.
 * 2. ROLE IN THE FLOW: This is where the application starts when executed from the terminal.
 * 3. STEP-BY-STEP LOGIC:
 *    - Read GEMINI_API_KEY from env.
 *    - Configure `commander` options and arguments.
 *    - Handle the `log` subcommand.
 *    - Handle the default action (interactive REPL or single-shot execution).
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
 *    1. Read `process.env.GEMINI_API_KEY`.
 *    2. If missing, print error to stderr and `process.exit(1)`.
 *    3. Return the key.
 * 4. INPUTS & OUTPUTS: Returns string.
 * 5. EDGE CASES TO HANDLE: Empty string -> treat as missing.
 * 6. SAMPLE CASE: Missing key -> exits process with error message.
 */
function requireApiKey(): string {
  // TODO: Implement API key check
  throw new Error("Not implemented");
}

const program = new Command();

// TODO: Configure the `commander` program (name, description, version).
// TODO: Define the `log` subcommand to read and print history.
// TODO: Define the main argument parsing logic to either `runTurn` (if args exist) or `startRepl`.
// TODO: Call `program.parseAsync(process.argv)`.
