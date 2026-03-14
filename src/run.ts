import assert from 'node:assert'
import * as core from '@actions/core'
import type { Octokit } from '@octokit/action'
import { parseExecutionFile } from './cca.js'
import type { AddIssueToProjectMutation } from './generated/graphql.js'
import type { Context } from './github.js'
import { getCurrentIssue } from './issue.js'
import { addIssueToProject } from './queries/addIssueToProject.js'
import { updateProjectFieldDateValue } from './queries/updateProjectFieldDateValue.js'
import { updateProjectFieldNumberValue } from './queries/updateProjectFieldNumberValue.js'

type Inputs = {
  executionFile: string
  projectId: string | undefined
  projectFieldIdCalls: string | undefined
  projectFieldIdLastCalledAt: string | undefined
  projectFieldIdCostUsd: string | undefined
}

export const run = async (inputs: Inputs, octokit: Octokit, context: Context): Promise<void> => {
  const issue = await getCurrentIssue(octokit, context)
  if (issue === undefined) {
    return
  }

  core.info(`Parsing the execution file: ${inputs.executionFile}`)
  const execution = await parseExecutionFile(inputs.executionFile)
  core.info(`The cost of current workflow run is ${execution.costUsd} USD`)

  if (!inputs.projectId) {
    return
  }

  const addIssueToProjectMutation = await addIssueToProject(octokit, {
    issueId: issue.id,
    projectId: inputs.projectId,
  })
  core.info(`Added #${issue.number} to the project ${inputs.projectId}`)

  assert(addIssueToProjectMutation.addProjectV2ItemById, `addProjectV2ItemById is required`)
  assert(addIssueToProjectMutation.addProjectV2ItemById.item, `addProjectV2ItemById.item is required`)
  const projectItemId = addIssueToProjectMutation.addProjectV2ItemById.item.id

  if (inputs.projectFieldIdLastCalledAt) {
    await updateProjectFieldDateValue(octokit, {
      itemId: projectItemId,
      projectId: inputs.projectId,
      fieldId: inputs.projectFieldIdLastCalledAt,
      date: new Date(),
    })
    core.info(`Updated the last-called-at field to today`)
  }

  if (inputs.projectFieldIdCalls) {
    await updateCallsFieldValue(
      projectItemId,
      inputs.projectId,
      inputs.projectFieldIdCalls,
      addIssueToProjectMutation,
      octokit,
    )
  }

  if (inputs.projectFieldIdCostUsd) {
    await updateCostUsdFieldValue(
      projectItemId,
      inputs.projectId,
      inputs.projectFieldIdCostUsd,
      execution.costUsd,
      addIssueToProjectMutation,
      octokit,
    )
  }
}

const updateCallsFieldValue = async (
  itemId: string,
  projectId: string,
  fieldId: string,
  mutation: AddIssueToProjectMutation,
  octokit: Octokit,
): Promise<void> => {
  const callsFieldValue = findFieldNumberValueById(mutation, fieldId)
  core.info(`The calls field is ${callsFieldValue === undefined ? 'not set' : callsFieldValue}`)
  const cumulativeCalls = (callsFieldValue ?? 0) + 1
  core.info(`The cumulative calls is ${cumulativeCalls}`)
  await updateProjectFieldNumberValue(octokit, {
    itemId,
    projectId,
    fieldId,
    number: cumulativeCalls,
  })
  core.info(`Updated the calls field to ${cumulativeCalls}`)
}

const updateCostUsdFieldValue = async (
  itemId: string,
  projectId: string,
  fieldId: string,
  costUsd: number,
  mutation: AddIssueToProjectMutation,
  octokit: Octokit,
): Promise<void> => {
  const costUsdFieldValue = findFieldNumberValueById(mutation, fieldId)
  core.info(`The cost-usd field is ${costUsdFieldValue === undefined ? 'not set' : `${costUsdFieldValue} USD`}`)
  const cumulativeCostUsd = (costUsdFieldValue ?? 0) + costUsd
  core.info(`The cumulative cost is ${cumulativeCostUsd} USD`)
  await updateProjectFieldNumberValue(octokit, {
    itemId,
    projectId,
    fieldId,
    number: Math.trunc(cumulativeCostUsd * 1e8) / 1e8,
  })
  core.info(`Updated the cost-usd field to ${cumulativeCostUsd} USD`)
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
