import type { Octokit } from '@octokit/action'
import type {
  UpdateProjectFieldDateValueMutation,
  UpdateProjectFieldDateValueMutationVariables,
} from '../generated/graphql.js'

const mutation = /* GraphQL */ `
  mutation updateProjectFieldDateValue($projectId: ID!, $itemId: ID!, $fieldId: ID!, $date: Date!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $projectId,
      itemId: $itemId,
      fieldId: $fieldId,
      value:  {
        date: $date
      }
    }) {
      projectV2Item {
        id
      }
    }
  }
`

export const updateProjectFieldDateValue = async (
  octokit: Octokit,
  v: UpdateProjectFieldDateValueMutationVariables,
): Promise<UpdateProjectFieldDateValueMutation> => await octokit.graphql(mutation, v)
