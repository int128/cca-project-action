# cca-project-action [![ts](https://github.com/int128/typescript-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/typescript-action/actions/workflows/ts.yaml)

This is an action to track the usage of claude-code-action in a GitHub project.

<img width="302" height="241" alt="image" src="https://github.com/user-attachments/assets/11eab17f-b279-4c6e-bb6b-507702c76813" />

## Getting Started

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
          private-key: ${{ secrets.PRIVATE_KEY }}
      - id: claude-code-action
        uses: anthropics/claude-code-action@v1
        with:
          # ...omitted...
      - uses: int128/cca-project-action@v1
        with:
          # The execution file is required to calculate the cost of claude-code-action.
          execution-file: ${{ steps.claude-code-action.outputs.execution_file }}
          # The token is required to update the GitHub project.
          token: ${{ steps.token.outputs.token }}
          # The project ID is required to update the GitHub project.
          project-id: PVT_...
          # The field IDs.
          project-field-id-calls: PVTF_...
          project-field-id-last-called-at: PVTF_...
          project-field-id-cost-usd: PVTF_...
```

### GitHub Project

Create a GitHub project and add the following fields:

- Calls
  - The field type must be **Number**.
  - This action will increment this field by 1.
- Last called at
  - The field type must be **Date**.
  - This action will update this field to the current date.
- Cost USD
  - The field type must be **Number**.
  - This action will increment this field by the cost of claude-code-action in USD.

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
