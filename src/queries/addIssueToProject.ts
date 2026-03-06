import type { Octokit } from '@octokit/action'
import type { AddIssueToProjectMutation, AddIssueToProjectMutationVariables } from '../generated/graphql.js'

const mutation = /* GraphQL */ `
  mutation addIssueToProject($issueId: ID!, $projectId: ID!) {
    addProjectV2ItemById(input:  {
       contentId: $issueId,
       projectId: $projectId
    }) {
      item {
        id
        fieldValues(first: 100) {
          nodes {
            __typename
            ... on ProjectV2ItemFieldNumberValue {
              field {
                __typename
                ... on ProjectV2Field {
                  id
                  name
                }
              }
              number
            }
          }
        }
      }
    }
  }
`

export const addIssueToProject = async (
  octokit: Octokit,
  v: AddIssueToProjectMutationVariables,
): Promise<AddIssueToProjectMutation> => await octokit.graphql(mutation, v)
