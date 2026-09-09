# Configuration & Usage

## Global History

Every command executed by the AI agent is logged for audit purposes. You can view your execution history by running:
```bash
aiagent log
```
The raw logs are stored in JSON Lines format at `~/.aiagent/history.jsonl`.

## Custom Aliases

You can configure project-specific behavior by creating an `.aiagent.yaml` file in the root of your workspace.

Currently supported configurations:

```yaml
aliases:
  dev: "npm run dev"
  build: "npm run build"
```

When the agent detects this file, it feeds the aliases into the LLM's context, making it smarter about your specific project scripts.
