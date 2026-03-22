# cca-project-action [![ts](https://github.com/int128/typescript-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/typescript-action/actions/workflows/ts.yaml)

This is an action to track the usage of claude-code-action in a GitHub project.
It is useful to improve the user experience and optimize the cost for AI interactions.

<img width="302" height="241" alt="image" src="https://github.com/user-attachments/assets/11eab17f-b279-4c6e-bb6b-507702c76813" />

## Getting Started

Add this action to your claude-code-action workflow as follows:

```yaml
jobs:
  claude-code-action:
    runs-on: ubuntu-latest
    steps:
      - id: claude-code-action
        uses: anthropics/claude-code-action@v1

      # Add to the project even if claude-code-action fails, to track the user experience and cost.
      - if: always()
        uses: actions/create-github-app-token@v3
        id: token
        with:
          app-id: ${{ secrets.APP_ID }}
          private-key: ${{ secrets.PRIVATE_KEY }}
      - if: always()
        uses: int128/cca-project-action@v1
        with:
          token: ${{ steps.token.outputs.token }}
          execution-file: ${{ steps.claude-code-action.outputs.execution_file }}
          project-id: PVT_...
          project-field-id-last-called-at: PVTF_...
          project-field-id-calls: PVTF_...
          project-field-id-cost-usd: PVTF_...
```

### GitHub Project

Create a GitHub project and add the following fields:

- Last called at
  - This field represents the last called date of `@claude`.
    It will be updated to the current date even if the run fails.
  - The field type must be Date.
  - You can sort the project by this field to see the most recent calls.
- Calls
  - This field represents the cumulative number of calls to `@claude`.
    It will be incremented for each workflow run even if the run fails.
  - The field type must be Number.
  - This indicates how many times the user interacted with AI. If high, the user can be exhausted.
- Cost USD
  - This field represents the cumulative cost in USD for claude-code-action.
    It will be incremented by the cost calculated from the execution file.
  - The field type must be Number.
  - This indicates how much the user has spent on AI. If high, the user can optimize the prompts.

If the field type is mismatched, the GitHub API will throw an error.

You can find the project ID using the following command:

```bash
gh project view --format json --jq .id --owner OWNER PROJECT_NUMBER
```

You can find the field IDs using the following command:

```bash
gh project field-list --owner OWNER --format json PROJECT_NUMBER
```

### GitHub App or Personal Access Token

This action requires a GitHub token to update a project.
Since `secrets.GITHUB_TOKEN` does not have permission to update a project,
you need to create a GitHub App or a Personal Access Token.
See [Automating Projects using Actions](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/automating-projects-using-actions) for more details.

The following permissions are required:

- Repository permissions
  - Issues: Read
  - Pull requests: Read
- Organization permissions
  - Projects: Read and Write

## Specification

### Inputs

| Name                              | Description                                            |
| --------------------------------- | ------------------------------------------------------ |
| `project-id`                      | The project ID (required)                              |
| `project-field-id-last-called-at` | The field ID for the last called date                  |
| `project-field-id-calls`          | The field ID for the cumulative calls                  |
| `execution-file`                  | The path to the execution file from claude-code-action |
| `project-field-id-cost-usd`       | The field ID for the cumulative cost in USD            |
| `token`                           | GitHub token (required)                                |

If `project-field-id-last-called-at` is provided, the action updates the field to the current date.

If `project-field-id-calls` is provided, the action increments the field by 1.

If both `project-field-id-cost-usd` and `execution-file` are provided, the action increments the field by the cost from the execution file.

### Outputs

| Name                  | Description                    |
| --------------------- | ------------------------------ |
| `cumulative-calls`    | The cumulative number of calls |
| `cumulative-cost-usd` | The cumulative cost in USD     |
