# Architecture

The AI Terminal Agent is designed to translate natural language into safe, verifiable shell commands. It operates as a local Node.js CLI tool that communicates with the Google Gemini API.

## Core Flow

1. **Context Collection (`src/context/`)**: Before every request, the agent captures the current state of the workspace. This includes OS platform, git status, npm scripts, and running Docker containers.
2. **LLM Generation (`src/llm/`)**: The system constructs a rich prompt combining the user request, system context, and conversation history, requesting a structured "tool call" from Gemini.
3. **Resolution & Validation (`src/executor/resolver.ts`)**: The AI's proposed tool and arguments are validated against the defined schema in the tool registry.
4. **Security Blocklist (`src/executor/blocklist.ts`)**: The resolved command string is checked against a hard-coded set of destructive patterns.
5. **Execution (`src/executor/runner.ts`)**: If safe (or confirmed by the user), the command is passed to `execa` for execution with live terminal output streaming.
6. **Logging (`src/logger/`)**: Every execution is appended to `~/.aiagent/history.jsonl` for auditability.

## Directory Structure

- `src/cli.ts` & `src/repl.ts`: Entry points for one-shot commands and interactive mode.
- `src/tools/`: Definitions of capabilities (git, npm, docker, shell) passed to the LLM.
- `src/executor/`: Safe resolution, blocklisting, and execution of commands.
- `src/context/`: Environmental data gatherers.
- `src/logger/`: Audit trail logging.
- `src/llm/`: Gemini API integration.
