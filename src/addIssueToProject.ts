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
  calls: number | null | undefined
  costUsd: number | null | undefined
  statusFieldId: string
  statusFieldOptionIds: string[]
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
  assert(mutation.addProjectV2ItemById.item.project, `addProjectV2ItemById.item.project is required`)

  // Status field should exist since created by GitHub.
  assert(
    mutation.addProjectV2ItemById.item.project.statusField,
    `addProjectV2ItemById.item.project.statusField is required`,
  )
  assert(
    mutation.addProjectV2ItemById.item.project.statusField.__typename === 'ProjectV2SingleSelectField',
    `addProjectV2ItemById.item.project.statusField.__typename must be ProjectV2SingleSelectField`,
  )
  assert(
    mutation.addProjectV2ItemById.item.project.statusField.id,
    `addProjectV2ItemById.item.project.statusField.id is required`,
  )

  return {
    itemId: mutation.addProjectV2ItemById.item.id,
    calls: v.projectFieldIdCalls ? findFieldNumberValueById(mutation, v.projectFieldIdCalls) : undefined,
    costUsd: v.projectFieldIdCostUsd ? findFieldNumberValueById(mutation, v.projectFieldIdCostUsd) : undefined,
    statusFieldId: mutation.addProjectV2ItemById.item.project.statusField.id,
    statusFieldOptionIds: mutation.addProjectV2ItemById.item.project.statusField.options.map((option) => option.id),
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
