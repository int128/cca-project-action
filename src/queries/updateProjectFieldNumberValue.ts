import * as core from '@actions/core'
import type { Octokit } from '@octokit/action'
import type {
  UpdateProjectFieldNumberValueMutation,
  UpdateProjectFieldNumberValueMutationVariables,
} from '../generated/graphql.js'

const mutation = /* GraphQL */ `
  mutation updateProjectFieldNumberValue($projectId: ID!, $itemId: ID!, $fieldId: ID!, $number: Float!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $projectId,
      itemId: $itemId,
      fieldId: $fieldId,
      value:  {
        number: $number
      }
    }) {
      projectV2Item {
        id
      }
    }
  }
`

export const updateProjectFieldNumberValue = async (
  octokit: Octokit,
  v: UpdateProjectFieldNumberValueMutationVariables,
) =>
  await core.group(`mutation updateProjectFieldNumberValue`, async () => {
    const truncated: UpdateProjectFieldNumberValueMutationVariables = {
      ...v,
      // https://github.com/cli/cli/issues/10342
      number: Math.trunc(v.number * 1e8) / 1e8,
    }
    const response: UpdateProjectFieldNumberValueMutation = await octokit.graphql(mutation, truncated)
    core.info(JSON.stringify(response, null, 2))
    return response
  })
