import * as core from '@actions/core'
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
        project {
          statusField: field(name: "Status") {
            __typename
            ... on ProjectV2SingleSelectField {
              id
              options {
                id
              }
            }
          }
        }
      }
    }
  }
`

export const addIssueToProjectMutation = async (octokit: Octokit, v: AddIssueToProjectMutationVariables) =>
  await core.group(`mutation addIssueToProject(${JSON.stringify(v)})`, async () => {
    const response: AddIssueToProjectMutation = await octokit.graphql(mutation, v)
    core.info(JSON.stringify(response, null, 2))
    return response
  })
