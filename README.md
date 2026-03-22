# cca-project-action [![ts](https://github.com/int128/typescript-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/typescript-action/actions/workflows/ts.yaml)

This is an action to track the usage of claude-code-action in a GitHub project.
It is useful to improve the user experience and optimize the cost for AI interactions.

<img width="302" height="241" alt="image" src="https://github.com/user-attachments/assets/11eab17f-b279-4c6e-bb6b-507702c76813" />

## Getting Started

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

If the field type is mismatched, this action will fail.

You can find the project ID using the following command:

```console
$ gh project view --format json --jq .id --owner OWNER PROJECT_NUMBER
PVT_kwDOAVRuvs4BSXon
```

You can find the field IDs using the following command:

```console
% gh project field-list --owner OWNER --format json PROJECT_NUMBER
{
  "fields": [
    {
      "id": "PVTSSF_lADOAVRuvs4BSXonzg_7KdA",
      "name": "Status",
      "options": [
        {
          "id": "f75ad846",
          "name": "Success"
        },
        {
          "id": "2660a4d9",
          "name": "Failure"
        }
      ],
      "type": "ProjectV2SingleSelectField"
    },
    {
      "id": "PVTF_lADOAVRuvs4BSXonzg_7LJ8",
      "name": "Last called at",
      "type": "ProjectV2Field"
    },
    // omitted...
  ]
}
```

### GitHub Actions

Add this action to your claude-code-action workflow as follows:

```yaml
jobs:
  claude-code-action:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/create-github-app-token@v3
        id: token
        with:
          app-id: ${{ secrets.APP_ID }}
          private-key: ${{ secrets.APP_PRIVATE_KEY }}
      - id: claude-code-action
        uses: anthropics/claude-code-action@v1

      # Add to the project even if claude-code-action fails, to track the user experience and cost.
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

## Advanced

### Transitioning the status field

You can track the failure of `@claude` calls using the status field of the project.
For example, you can set the field options to "Success" and "Failure", and track the final status of the `@claude` call.

```yaml
jobs:
  claude-code-action:
    runs-on: ubuntu-latest
    steps:
      - id: claude-code-action
        uses: anthropics/claude-code-action@v1
      - if: always()
        uses: int128/cca-project-action@v1
        with:
          token: ${{ steps.token.outputs.token }}
          execution-file: ${{ steps.claude-code-action.outputs.execution_file }}
          # Transition the status field to "Success" or "Failure"
          project-status-field-option-id: ${{ case(steps.claude-code-action.outcome == 'success', 'SUCCESS_OPTION_ID', 'FAILURE_OPTION_ID') }}
```

## Specification

### Inputs

| Name                              | Description                                            |
| --------------------------------- | ------------------------------------------------------ |
| `execution-file`                  | The path to the execution file from claude-code-action |
| `project-id`                      | The project ID (required)                              |
| `project-field-id-last-called-at` | The field ID for the last called date                  |
| `project-field-id-calls`          | The field ID for the cumulative calls                  |
| `project-field-id-cost-usd`       | The field ID for the cumulative cost in USD            |
| `project-status-field-option-id`  | The field option ID to transition the status field     |
| `token`                           | GitHub token (required)                                |

If `project-field-id-last-called-at` is provided, the action updates the field to the current date.

If `project-field-id-calls` is provided, the action increments the field by 1.

If both `project-field-id-cost-usd` and `execution-file` are provided, the action increments the field by the cost from the execution file.

If `project-status-field-option-id` is provided, the action transitions the status field to the specified option ID.

### Outputs

| Name                  | Description                    |
| --------------------- | ------------------------------ |
| `cumulative-calls`    | The cumulative number of calls |
| `cumulative-cost-usd` | The cumulative cost in USD     |

### GitHub token permissions

This action requires a GitHub token to update a project.
You need to create a GitHub App or a Personal Access Token,
since `secrets.GITHUB_TOKEN` does not have permissions to update a project.
See [Automating Projects using Actions](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/automating-projects-using-actions) for more details.

The following permissions are required:

- Repository permissions
  - Issues: Read
  - Pull requests: Read
- Organization permissions
  - Projects: Read and Write
