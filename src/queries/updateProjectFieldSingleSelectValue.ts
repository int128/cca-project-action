import * as core from '@actions/core'
import type { Octokit } from '@octokit/action'
import type {
  UpdateProjectFieldSingleSelectValueMutation,
  UpdateProjectFieldSingleSelectValueMutationVariables,
} from '../generated/graphql.js'

const mutation = /* GraphQL */ `
  mutation updateProjectFieldSingleSelectValue($projectId: ID!, $itemId: ID!, $fieldId: ID!, $singleSelectOptionId: String!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $projectId,
      itemId: $itemId,
      fieldId: $fieldId,
      value:  {
        singleSelectOptionId: $singleSelectOptionId
      }
    }) {
      projectV2Item {
        id
      }
    }
  }
`

export const updateProjectFieldSingleSelectValue = async (
  octokit: Octokit,
  v: UpdateProjectFieldSingleSelectValueMutationVariables,
) =>
  await core.group(`mutation updateProjectFieldSingleSelectValue(${JSON.stringify(v)})`, async () => {
    const response: UpdateProjectFieldSingleSelectValueMutation = await octokit.graphql(mutation, v)
    core.info(JSON.stringify(response, null, 2))
    return response
  })
