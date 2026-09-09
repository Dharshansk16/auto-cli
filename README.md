# AI Terminal Agent

Turn plain-English requests into safe, confirmed shell actions — git, npm, docker, and arbitrary commands as a fallback.

```
autocli "push the code"
autocli "start the frontend"
autocli "show docker logs"
autocli              # interactive mode
autocli log          # view execution history
```

## Setup

```bash
npm install
export GEMINI_API_KEY="your-key-here"   # get one free at aistudio.google.com/app/apikey
npm run dev -- "git status"
```

To build and link it as a global command:

```bash
npm run build
npm link
autocli "push the code"
```

## How it works

1. Gathers project context (git state, package.json scripts, running docker containers)
2. Sends your request + context to Gemini 3.1 Flash-Lite with a fixed set of tool schemas
3. The model either returns a structured tool call or a clarifying question
4. The resolved command is checked against a hard blocklist, then run through a safety
   tier: read-only commands auto-run, everything else requires a y/n confirmation
5. Execution output streams live; every run is logged to `~/.autocli/history.jsonl`

See `PROJECT_DOCUMENTATION.md` and `SYSTEM_FLOW_AND_BUILD_GUIDE.md` for the full design rationale.

## Project structure

```
src/
├── cli.ts              # entry point (commander)
├── repl.ts              # interactive mode
├── run-turn.ts           # core orchestration: LLM call -> validate -> confirm -> execute -> log
├── types.ts              # shared types
├── llm/
│   └── gemini.ts          # Gemini function-calling client
├── tools/
│   ├── registry.ts         # combines all tool sets
│   ├── git.ts
│   ├── npm.ts
│   ├── docker.ts
│   └── shell.ts            # generic execute_shell_command fallback
├── executor/
│   ├── resolver.ts          # validates args, builds command string
│   ├── blocklist.ts          # hard-coded destructive pattern blocklist
│   └── runner.ts              # execa wrapper, streams output
├── context/
│   └── detector.ts             # detects git/npm/docker state for prompting
├── config/
│   └── loader.ts                # loads .autocli.yaml per-project aliases
└── logger/
    └── history.ts                 # audit log
```

## Adding a new tool

1. Add a `ToolDefinition` entry to the relevant file in `src/tools/` (or create a new file)
2. Register it in `src/tools/registry.ts`
3. Set `safety: "auto"` only for genuinely read-only commands — default to `"confirm"`

## Safety notes

- The generic `execute_shell_command` tool always requires confirmation, with no
  auto-run exception, since its command string comes directly from the model.
- `src/executor/blocklist.ts` blocks destructive patterns (recursive deletes of
  root/home, fork bombs, `sudo`, raw disk writes, force-pushes, piping remote
  scripts into a shell) regardless of which tool produced the command.
- Extend the blocklist as you find more patterns you want to hard-block — it's
  meant to be a living list, not a one-time exercise.
