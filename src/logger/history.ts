/**
 * 1. PURPOSE: Manages the command execution audit log in the user's home directory.
 * 2. ROLE IN THE FLOW: `logExecution` is called by `run-turn.ts` after every run; `readHistory` is called by the `cli.ts` log command.
 * 3. STEP-BY-STEP LOGIC:
 *    - Define paths using `os.homedir()`.
 *    - Implement append-to-file logic.
 *    - Implement read-from-file and JSON parsing logic.
 * 4. INPUTS & OUTPUTS: Functions for writing `HistoryEntry` and reading an array of `HistoryEntry`.
 * 5. EDGE CASES TO HANDLE: Missing directories, file does not exist on read.
 * 6. SAMPLE CASE: `logExecution({ ... })` appends a JSON line to `~/.aiagent/history.jsonl`.
 */
import { existsSync, mkdirSync, appendFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { HistoryEntry } from "../types.js";

/**
 * 1. PURPOSE: Ensures the `~/.aiagent` directory exists.
 * 2. ROLE IN THE FLOW: Called right before writing a log entry.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Check if history dir exists.
 *    2. If not, create it recursively using `mkdirSync`.
 * 4. INPUTS & OUTPUTS: No inputs, no return.
 * 5. EDGE CASES TO HANDLE: Permissions issues (let it throw natively).
 * 6. SAMPLE CASE: Dir doesn't exist -> creates it.
 */
function ensureHistoryDir(): void {
  // TODO: Implement directory creation
  const dir=join(homedir(), ".aiagent");
  if(!existsSync(dir)){
    mkdirSync(dir, {recursive: true});
  }
}

/**
 * 1. PURPOSE: Appends a single execution entry to the JSON Lines log file.
 * 2. ROLE IN THE FLOW: Called by `run-turn.ts` after a command finishes.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Call `ensureHistoryDir()`.
 *    2. Append stringified JSON object + newline to `history.jsonl`.
 * 4. INPUTS & OUTPUTS: Input: `HistoryEntry` object. Output: void.
 * 5. EDGE CASES TO HANDLE: Concurrent writes (native append is usually fine).
 * 6. SAMPLE CASE: Input `{ tool: "git_status" }` -> File gets a new line.
 */
const HISTORY_FILE= join(homedir(), ".aiagent", "history.jsonl");

export function logExecution(entry: HistoryEntry): void {
  // TODO: Implement append logic
  ensureHistoryDir();
  appendFileSync(HISTORY_FILE, JSON.stringify(entry) + "\n");
}

/**
 * 1. PURPOSE: Reads the most recent N lines from the history log.
 * 2. ROLE IN THE FLOW: Called by the `aiagent log` CLI command.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Check if file exists. Return empty array if not.
 *    2. Read file content, split by newline, filter empty.
 *    3. Parse each line as JSON to `HistoryEntry`.
 *    4. Return the last N items (slice).
 * 4. INPUTS & OUTPUTS: Input: number (limit). Output: `HistoryEntry[]`.
 * 5. EDGE CASES TO HANDLE: Empty file, invalid JSON format.
 * 6. SAMPLE CASE: Input `limit=2` -> returns the array of the 2 most recent entries.
 */
export function readHistory(limit = 20): HistoryEntry[] {
  // TODO: Implement read logic
  if(!existsSync(HISTORY_FILE)){
    return [];
  }

  const content=readFileSync(HISTORY_FILE, "utf-8");
  const lines=content.split("\n").filter((line)=>line.trim().length>0);
  // const entries:HistoryEntry[]=lines.map((line)=>JSON.parse(line));
  const entries: HistoryEntry[] = lines.flatMap((line) => {
    try {
      return [JSON.parse(line) as HistoryEntry];
    } catch {
      return [];
    }
  });
  return entries.slice(-limit);
  // throw new Error("Not implemented");
}
