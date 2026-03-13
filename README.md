# cca-project-action [![ts](https://github.com/int128/typescript-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/typescript-action/actions/workflows/ts.yaml)

Aggregate claude-code-action issues to the GitHub project.

## Getting Started

To run this action, create a workflow as follows:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - id: claude-code-action
        uses: anthropics/claude-code-action@v1
        with:
          # ...omitted...
      - uses: int128/cca-project-action@v1
        with:
          execution-file: ${{ steps.claude-code-action.outputs.execution_file }}
          project-id: PVT_...
          project-field-id-calls: PVTF_...
          project-field-id-cost-usd: PVTF_...
```

You can find the project ID using the following command:

```bash
gh project view --format json --jq .id --owner OWNER PROJECT_NUMBER
```

You can find the field IDs using the following command:

```bash
gh project field-list --owner OWNER --format json PROJECT_NUMBER
```

### Inputs

| Name                        | Default    | Description                                                        |
| --------------------------- | ---------- | ------------------------------------------------------------------ |
| `execution-file`            | (required) | The path to the execution file from claude-code-action             |
| `project-id`                | -          | The GitHub project ID                                              |
| `project-field-id-calls`    | -          | The GitHub project field ID for number of claude-code-action calls |
| `project-field-id-cost-usd` | -          | The GitHub project field ID for cost in USD                        |
| `token`                     | (required) | GitHub token                                                       |

### Outputs

| Name      | Description    |
| --------- | -------------- |
| `example` | example output |
