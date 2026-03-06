import assert from 'node:assert'
import * as core from '@actions/core'
import type { Octokit } from '@octokit/action'
import { parseExecutionFile } from './cca.js'
import type { AddIssueToProjectMutation } from './generated/graphql.js'
import type { Context } from './github.js'
import { getCurrentIssue } from './issue.js'
import { addIssueToProject } from './queries/addIssueToProject.js'
import { updateProjectFieldNumberValue } from './queries/updateProjectFieldNumberValue.js'

type Inputs = {
  executionFile: string
  projectId: string | undefined
  projectFieldIdCostUsd: string | undefined
}

export const run = async (inputs: Inputs, octokit: Octokit, context: Context): Promise<void> => {
  const issue = await getCurrentIssue(octokit, context)
  if (issue === undefined) {
    return
  }

  core.info(`Parsing the execution file: ${inputs.executionFile}`)
  const execution = await parseExecutionFile(inputs.executionFile)
  core.info(`The cost of current workflow run is ${execution.totalCostUsd} USD`)

  if (!inputs.projectId) {
    return
  }

  const addIssueToProjectMutation = await addIssueToProject(octokit, {
    issueId: issue.id,
    projectId: inputs.projectId,
  })
  core.info(`Added #${issue.number} to the project ${inputs.projectId}`)

  if (!inputs.projectFieldIdCostUsd) {
    return
  }

  const costUsdFieldValue = findFieldNumberValueById(addIssueToProjectMutation, inputs.projectFieldIdCostUsd)
  core.info(`The cost-usd field is ${costUsdFieldValue === undefined ? 'not set' : `${costUsdFieldValue} USD`}`)
  const cumulativeCostUsd = (costUsdFieldValue ?? 0) + execution.totalCostUsd
  core.info(`The cumulative cost is ${cumulativeCostUsd} USD`)

  await updateProjectFieldNumberValue(octokit, {
    itemId: addIssueToProjectMutation.addProjectV2ItemById?.item?.id ?? '',
    projectId: inputs.projectId,
    fieldId: inputs.projectFieldIdCostUsd,
    // https://github.com/cli/cli/issues/10342
    number: Math.trunc(cumulativeCostUsd * 1e8) / 1e8,
  })
  core.info(`Updated the project field ${inputs.projectFieldIdCostUsd}`)
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
