import assert from 'node:assert'
import type { Octokit } from '@octokit/action'
import type { AddIssueToProjectMutation } from './generated/graphql.js'
import { addIssueToProjectMutation } from './queries/addIssueToProject.js'

type AddIssueToProject = {
  projectId: string
  issueId: string
  projectFieldIdCalls: string | undefined
  projectFieldIdCostUsd: string | undefined
}

export const addIssueToProject = async (octokit: Octokit, v: AddIssueToProject) => {
  const mutation = await addIssueToProjectMutation(octokit, {
    issueId: v.issueId,
    projectId: v.projectId,
  })
  return parseAddIssueToProjectMutation(mutation, v)
}

export const parseAddIssueToProjectMutation = (mutation: AddIssueToProjectMutation, v: AddIssueToProject) => {
  assert(mutation.addProjectV2ItemById, `addProjectV2ItemById is required`)
  assert(mutation.addProjectV2ItemById.item, `addProjectV2ItemById.item is required`)
  return {
    itemId: mutation.addProjectV2ItemById.item.id,
    calls: v.projectFieldIdCalls ? findFieldNumberValueById(mutation, v.projectFieldIdCalls) : undefined,
    costUsd: v.projectFieldIdCostUsd ? findFieldNumberValueById(mutation, v.projectFieldIdCostUsd) : undefined,
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
