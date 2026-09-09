# Contributing to AI Terminal Agent

We welcome contributions! Please follow these guidelines to ensure a smooth process.

## Getting Started

1. Fork and clone the repository.
2. Run `npm install` to install dependencies.
3. Set up your `.env` file with `GEMINI_API_KEY="your-key-here"`.
4. Run `npm run dev -- "your command"` to test locally.

## Adding a New Tool

Tools are how the AI interacts with the system. To add a new tool:
1. Create or update a file in `src/tools/` (e.g., `git.ts`, `aws.ts`).
2. Define a `ToolDefinition` object following the schema in `src/types.ts`.
3. Be precise with your `parameters` schema—the LLM relies on these to structure its response.
4. Set `safety: "confirm"` for any action that mutates state. Use `safety: "auto"` only for pure read operations.
5. Add your new tool to the `ALL_TOOLS` array in `src/tools/registry.ts`.

## Code Style

- We use TypeScript strictly. Avoid `any` where possible.
- All core logic should be documented with a PURPOSE, ROLE IN THE FLOW, and EDGE CASES comment block.
- Run `npm run build` to verify there are no TypeScript compilation errors before submitting a PR.
