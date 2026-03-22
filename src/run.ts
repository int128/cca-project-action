import assert from 'node:assert'
import * as core from '@actions/core'
import type { Octokit } from '@octokit/action'
import { addIssueToProject } from './addIssueToProject.js'
import { parseExecutionFile } from './cca.js'
import type { Context } from './github.js'
import { getCurrentIssue } from './issue.js'
import { updateProjectFieldDateValue } from './queries/updateProjectFieldDateValue.js'
import { updateProjectFieldNumberValue } from './queries/updateProjectFieldNumberValue.js'
import { updateProjectFieldSingleSelectValue } from './queries/updateProjectFieldSingleSelectValue.js'

type Inputs = {
  executionFile: string | undefined
  projectId: string
  projectFieldIdCalls: string | undefined
  projectFieldIdLastCalledAt: string | undefined
  projectFieldIdCostUsd: string | undefined
  projectStatusFieldValueId: string | undefined
}

type Outputs = {
  cumulativeCalls: number | undefined
  cumulativeCostUsd: number | undefined
}

export const run = async (inputs: Inputs, octokit: Octokit, context: Context): Promise<Outputs | undefined> => {
  const issue = await getCurrentIssue(octokit, context)
  if (issue === undefined) {
    core.warning(`No issue or pull request found for the current context.`)
    return
  }

  const addIssueToProjectResponse = await addIssueToProject(octokit, {
    issueId: issue.id,
    projectId: inputs.projectId,
    projectFieldIdCalls: inputs.projectFieldIdCalls,
    projectFieldIdCostUsd: inputs.projectFieldIdCostUsd,
  })
  core.info(`Added #${issue.number} to the project ${inputs.projectId}`)

  if (inputs.projectStatusFieldValueId) {
    assert(
      addIssueToProjectResponse.statusFieldOptionIds.includes(inputs.projectStatusFieldValueId),
      `project-status-field-value-id must be one of ${addIssueToProjectResponse.statusFieldOptionIds.join(', ')}`,
    )
    await updateProjectFieldSingleSelectValue(octokit, {
      itemId: addIssueToProjectResponse.itemId,
      projectId: inputs.projectId,
      fieldId: addIssueToProjectResponse.statusFieldId,
      singleSelectOptionId: inputs.projectStatusFieldValueId,
    })
    core.info(`Updated the status field to ${inputs.projectStatusFieldValueId}`)
  }

  if (inputs.projectFieldIdLastCalledAt) {
    await updateProjectFieldDateValue(octokit, {
      itemId: addIssueToProjectResponse.itemId,
      projectId: inputs.projectId,
      fieldId: inputs.projectFieldIdLastCalledAt,
      date: new Date(),
    })
    core.info(`Updated the last-called-at field to today`)
  }

  let cumulativeCalls = addIssueToProjectResponse.calls
  core.info(`The calls field is ${cumulativeCalls ?? 'not set'}`)
  let cumulativeCostUsd = addIssueToProjectResponse.costUsd
  core.info(`The cost-usd field is ${cumulativeCostUsd ?? 'not set'}`)

  if (inputs.projectFieldIdCalls) {
    cumulativeCalls = (cumulativeCalls ?? 0) + 1
    await updateProjectFieldNumberValue(octokit, {
      itemId: addIssueToProjectResponse.itemId,
      projectId: inputs.projectId,
      fieldId: inputs.projectFieldIdCalls,
      number: cumulativeCalls,
    })
    core.info(`Updated the calls field to ${cumulativeCalls}`)
  }

  if (inputs.executionFile === undefined) {
    core.info(`No execution file provided, skipping the cost calculation.`)
    return {
      cumulativeCalls,
      cumulativeCostUsd,
    }
  }
  core.info(`Parsing the execution file: ${inputs.executionFile}`)
  const execution = await parseExecutionFile(inputs.executionFile)
  core.info(`The cost of current workflow run is ${execution.costUsd} USD`)

  if (inputs.projectFieldIdCostUsd) {
    cumulativeCostUsd = (cumulativeCostUsd ?? 0) + execution.costUsd
    await updateProjectFieldNumberValue(octokit, {
      itemId: addIssueToProjectResponse.itemId,
      projectId: inputs.projectId,
      fieldId: inputs.projectFieldIdCostUsd,
      number: cumulativeCostUsd,
    })
    core.info(`Updated the cost-usd field to ${cumulativeCostUsd} USD`)
  }

  return {
    cumulativeCalls,
    cumulativeCostUsd,
  }
}
