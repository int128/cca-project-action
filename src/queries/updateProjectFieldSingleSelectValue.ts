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
): Promise<UpdateProjectFieldSingleSelectValueMutation> => await octokit.graphql(mutation, v)
