import type { Octokit } from '@octokit/action'
import type { GetAssociatedPullRequestQuery, GetAssociatedPullRequestQueryVariables } from '../generated/graphql.js'

const query = /* GraphQL */ `
  mutation addIssueToProject($issueId: ID!, $projectId: ID!) {
    addProjectV2ItemById(input:  {
       contentId: $issueId,
       projectId: $projectId
    }) {
      item {
        id
      }
    }
  }
`

export const getProjectField = async (
  octokit: Octokit,
  v: GetProjectFieldQueryVariables,
): Promise<GetProjectFieldQuery> => await octokit.graphql(query, v)
