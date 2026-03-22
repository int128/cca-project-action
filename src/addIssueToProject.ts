import assert from 'node:assert'
import type { Octokit } from '@octokit/action'
import type { AddIssueToProjectMutation } from './generated/graphql.js'
import { addIssueToProjectMutation } from './queries/addIssueToProject.js'

export type AddIssueToProjectRequest = {
  projectId: string
  issueId: string
  projectFieldIdCalls: string | undefined
  projectFieldIdCostUsd: string | undefined
}

export type AddIssueToProjectResponse = {
  itemId: string
  calls: number | undefined
  costUsd: number | undefined
}

export const addIssueToProject = async (octokit: Octokit, v: AddIssueToProjectRequest) => {
  const mutation = await addIssueToProjectMutation(octokit, {
    issueId: v.issueId,
    projectId: v.projectId,
  })
  return parseAddIssueToProjectMutation(mutation, v)
}

export const parseAddIssueToProjectMutation = (
  mutation: AddIssueToProjectMutation,
  v: AddIssueToProjectRequest,
): AddIssueToProjectResponse => {
  assert(mutation.addProjectV2ItemById, `addProjectV2ItemById is required`)
  assert(mutation.addProjectV2ItemById.item, `addProjectV2ItemById.item is required`)
  let calls: number | undefined
  if (v.projectFieldIdCalls) {
    calls = findFieldNumberValueById(mutation, v.projectFieldIdCalls) ?? undefined
  }
  let costUsd: number | undefined
  if (v.projectFieldIdCostUsd) {
    costUsd = findFieldNumberValueById(mutation, v.projectFieldIdCostUsd) ?? undefined
  }
  return {
    itemId: mutation.addProjectV2ItemById.item.id,
    calls,
    costUsd,
  }
}

const findFieldNumberValueById = (mutation: AddIssueToProjectMutation, fieldId: string) => {
  assert(mutation.addProjectV2ItemById, `addProjectV2ItemById is required`)
  assert(mutation.addProjectV2ItemById.item, `addProjectV2ItemById.item is required`)
  assert(mutation.addProjectV2ItemById.item.fieldValues, `addProjectV2ItemById.item.fieldValues is required`)
  assert(
    mutation.addProjectV2ItemById.item.fieldValues.nodes,
    `addProjectV2ItemById.item.fieldValues.nodes is required`,
  )
  for (const node of mutation.addProjectV2ItemById.item.fieldValues.nodes) {
    if (
      node != null &&
      node.__typename === 'ProjectV2ItemFieldNumberValue' &&
      node.field.__typename === 'ProjectV2Field' &&
      node.field.id === fieldId
    ) {
      return node.number
    }
  }
  return undefined
}
