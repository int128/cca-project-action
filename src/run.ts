import * as core from '@actions/core'
import type { Octokit } from '@octokit/action'
import type { Context } from './github.js'
import { getCurrentIssue } from './issue.js'
import { parseExecutionFile } from './cca.js'
import { addIssueToProject } from './queries/addIssueToProject.js'
import { AddIssueToProjectMutation } from './generated/graphql.js'
import assert from 'node:assert'
import { updateProjectFieldNumberValue } from './queries/updateProjectFieldNumberValue.js'

type Inputs = {
  projectId: string
  projectFieldIdCostUsd: string
  executionFile: string
}

export const run = async (inputs: Inputs, octokit: Octokit, context: Context): Promise<void> => {
  const issue = await getCurrentIssue(octokit, context)
  if (issue === undefined) {
    return
  }

  core.info(`Parsing the execution file: ${inputs.executionFile}`)
  const execution = await parseExecutionFile(inputs.executionFile)
  core.info(`The cost of current workflow run is ${execution.totalCostUsd} USD`)

  const addIssueToProjectMutation = await addIssueToProject(octokit, {
    issueId: issue.id,
    projectId: inputs.projectId,
  })
  core.info(`Added #${issue.number} to the project ${inputs.projectId}`)

  const previousCostUsd = findFieldNumberValueById(addIssueToProjectMutation, inputs.projectFieldIdCostUsd)
  core.info(`The cost-usd field is ${previousCostUsd === undefined ? 'not set' : `${previousCostUsd} USD`}`)
  const cumulativeCostUsd = (previousCostUsd ?? 0) + execution.totalCostUsd
  core.info(`The cumulative cost is ${cumulativeCostUsd} USD`)

  await updateProjectFieldNumberValue(octokit, {
    issueId: issue.id,
    projectId: inputs.projectId,
    fieldId: inputs.projectFieldIdCostUsd,
    number: cumulativeCostUsd,
  })
  core.info(`Updated the project field ${inputs.projectFieldIdCostUsd} to ${cumulativeCostUsd} USD`)
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
