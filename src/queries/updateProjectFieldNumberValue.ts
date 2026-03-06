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
): Promise<UpdateProjectFieldNumberValueMutation> => await octokit.graphql(mutation, v)
