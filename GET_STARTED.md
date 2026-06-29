# Get Started

_Assumed Capacity: This plan is calibrated for ~3-4 focused hours per day per developer._

## 1. Overview

This project is an AI-powered terminal agent that translates natural language requests into executable shell commands safely. We have gutted the entire source code into a "learning skeleton" — every file now contains detailed instructional comments (blueprints) instead of working code. Over the next 7 days, our 3-person team will rebuild the core logic file-by-file to deeply learn how LLM-based terminal orchestration, command validation, and system context detection work together.

## 2. Before You Start

### Setup Steps

1. **Clone & Branch:** Clone the repository. Create a new working branch (e.g., `rebuild-team-alpha`).
2. **Install:** Run `npm install` to grab all dependencies.
3. **Environment:** Create a `.env` file at the root and add `GEMINI_API_KEY="your-key-here"`.
4. **Execution:** You can test your code using `npm run dev -- "your command"`.
5. **Types:** The `src/types.ts` file has been left mostly intact because it defines the contracts you all share. **Review it together on Day 1.**

### Reading the Skeleton Files

Open any file in `src/`. You'll see comment blocks containing:

- **PURPOSE:** What the file does.
- **ROLE IN THE FLOW:** Who calls it, and who it calls.
- **STEP-BY-STEP LOGIC:** The exact sequence of operations to implement.
- **INPUTS & OUTPUTS:** Type signatures and expected return values.
- **EDGE CASES:** Things that will crash the app if you forget them.
- **SAMPLE CASE:** Real-world data to test your logic against.

Do not delete the function signatures or imports. Write your code directly inside the function bodies based on the numbered logic steps.

## 3. Project Flow (Quick Recap)

1. **CLI/REPL:** The user types a command (`src/cli.ts` / `src/repl.ts`).
2. **Context Gathering:** We snapshot their local environment (git status, package.json, docker) (`src/context/detector.ts`).
3. **LLM Generation:** The request and context go to the Gemini API (`src/llm/gemini.ts`), which returns a structured Tool Call.
4. **Resolution:** We validate the LLM's tool arguments (`src/executor/resolver.ts`) using our tool registry (`src/tools/*`).
5. **Safety:** The resolved shell command is checked against a hard blocklist (`src/executor/blocklist.ts`). If modifying/dangerous, we prompt for confirmation.
6. **Execution & Logging:** The command runs via `execa` (`src/executor/runner.ts`) and is logged (`src/logger/history.ts`).

## 4. Team Split

The 16 files have been divided into three vertical slices so nobody is idle waiting on someone else's implementation.

- **Dev A: The Execution & Security Layer**
  - `src/logger/history.ts`
  - `src/config/loader.ts`
  - `src/executor/blocklist.ts`
  - `src/executor/runner.ts`
  - `src/executor/resolver.ts`

- **Dev B: The Environment Context & Tools Layer**
  - `src/tools/git.ts`
  - `src/tools/shell.ts`
  - `src/tools/npm.ts`
  - `src/tools/docker.ts`
  - `src/tools/registry.ts`
  - `src/context/detector.ts`

- **Dev C: The LLM & Orchestration Layer**
  - `src/types.ts` (Shared/Review only)
  - `src/llm/gemini.ts`
  - `src/repl.ts`
  - `src/cli.ts`
  - `src/run-turn.ts` (The orchestrator)

## 5. Day-by-Day Plan

### Day 1: Foundation & Independence

**Goal:** Everyone builds out their standalone utility files that don't depend on other system components.

- **All Devs:** Review `src/types.ts` together for 10 minutes to understand the contracts.
- **Dev A:** Implement `src/logger/history.ts` (file writing/reading) and `src/config/loader.ts` (YAML parsing).
- **Dev B:** Implement `src/tools/shell.ts` and `src/tools/git.ts`. Focus on the `resolve` functions and safe string escaping.
- **Dev C:** Implement `src/llm/gemini.ts`. Focus on mapping our `ToolDefinition` to the Gemini SDK schema and handling the API call.
- **Checkpoint:** Sync for 15 min: Dev C confirms they understand how Dev B's tools will be passed into the LLM.

### Day 2: Core Mechanisms

**Goal:** Build the heavy lifters of the application.

- **Dev A:** Implement `src/executor/blocklist.ts` (regex matching) and `src/executor/runner.ts` (execa integration).
- **Dev B:** Implement `src/tools/npm.ts` and `src/tools/docker.ts`. Ensure safety tiers are correct.
- **Dev C:** Finish `src/llm/gemini.ts` if needed. Implement `src/repl.ts` to handle the interactive user loop using `@clack/prompts`.
- **Checkpoint:** Sync for 15 min: Dev A confirms they know what `runner.ts` expects. Dev B confirms all tool definitions are ready.

### Day 3: Context & CLI Setup

**Goal:** Hook into the OS environment and set up the command line interface.

- **Dev A:** Implement `src/executor/resolver.ts`. You will need to validate args based on the tool parameters Dev B created.
- **Dev B:** Implement `src/context/detector.ts`. This is a big file—focus on spawning child processes to check git/docker safely without crashing.
- **Dev C:** Implement `src/cli.ts`. Set up `commander`, parse arguments, and implement the `log` subcommand (which calls Dev A's history logger).
- **Checkpoint:** Sync for 15 min: Dev A and Dev B review `resolver.ts` to ensure arg validation aligns with tool requirements.

### Day 4: The Great Orchestration

**Goal:** Dev C builds `run-turn.ts` which stitches everything together, while A and B finish up and test.

- **Dev A:** Review and manually unit-test the executor layer. Make sure the blocklist properly catches `rm -rf /`.
- **Dev B:** Implement `src/tools/registry.ts` to aggregate all tools, and finish `src/context/detector.ts`.
- **Dev C:** Implement `src/run-turn.ts`. This is the hardest file. You will import from Dev A and Dev B. You can start writing the logic even if A and B have minor bugs, because the function signatures (contracts) exist.
- **Checkpoint:** Sync for 15 min: Dev C walks A and B through `run-turn.ts` to ensure no steps were missed (e.g., did we forget to call the logger?).

### Day 5: Integration Day

**Goal:** Connect all the wires. The app should compile and run its first real command.

- **All Devs:** Mob program or pair up to run `npm run dev -- "git status"`.
- **Dev A:** Fix any bugs where the command execution hangs or the blocklist crashes.
- **Dev B:** Fix any bugs where context detection fails on your specific OS.
- **Dev C:** Fix any LLM prompt formatting issues or parsing errors from Gemini.
- **Checkpoint:** Celebrate the first successful end-to-end command execution.

### Day 6: End-to-End Testing

**Goal:** Break the application on purpose and fix the edge cases.

- **All Devs:** Test the interactive REPL (`npm run dev`).
- Try edge cases: Stop your docker daemon, delete your `.git` folder, ask the LLM to do something vague, ask it to run a destructive command (`sudo rm ...`).
- Fix the resulting crashes across your respective domains.

### Day 7: Polish & Review

**Goal:** Clean up the codebase and verify against the requirements.

- Review every file against the "How to Know You're Done" checklist below.
- Clean up any stray `console.log` statements.
- Ensure the history log formats nicely.

## 6. How to Know You're Done With a File

Before closing out a file, ask yourself:

1. [ ] Did I implement the exact numbered steps in the **STEP-BY-STEP LOGIC**?
2. [ ] Does my function actually return the types specified in **INPUTS & OUTPUTS**?
3. [ ] Did I explicitly write a branch or try/catch to handle the **EDGE CASES**?
4. [ ] If I pass in the **SAMPLE CASE**, does it output exactly what the comment says?

## 7. Daily Sync Format

Keep standups under 15 minutes. Every person answers:

1. **What did I finish yesterday?**
2. **What am I building today?**
3. **Am I blocked on anyone's code?** (e.g., "I need Dev B's `ALL_TOOLS` array to test my LLM prompt.")

## 8. If You Get Stuck

**Rely on your team:** If Dev C can't figure out why a tool isn't resolving, pair up with Dev B (who owns the tools).
