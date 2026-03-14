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
          project-field-id-last-called-at: PVTF_...
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

## Specification

### Inputs

| Name             | Default    | Description                                            |
| ---------------- | ---------- | ------------------------------------------------------ |
| `execution-file` | (required) | The path to the execution file from claude-code-action |
| `project-id`     | -          | The GitHub project ID                                  |
| `token`          | (required) | GitHub token                                           |

You can set the GitHub project fields as follows:

| Name                              | Field type | Description                |
| --------------------------------- | ---------- | -------------------------- |
| `project-field-id-last-called-at` | Date       | The last called date       |
| `project-field-id-calls`          | Number     | The number of calls        |
| `project-field-id-cost-usd`       | Number     | The cumulative cost in USD |

### Outputs

| Name      | Description    |
| --------- | -------------- |
| `example` | example output |
