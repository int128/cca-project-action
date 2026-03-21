import * as core from '@actions/core'
import type { Octokit } from '@octokit/action'
import { addIssueToProject } from './addIssueToProject.js'
import { parseExecutionFile } from './cca.js'
import type { Context } from './github.js'
import { getCurrentIssue } from './issue.js'
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
    projectFieldIdCalls: inputs.projectFieldIdCalls,
    projectFieldIdCostUsd: inputs.projectFieldIdCostUsd,
  })
  core.info(`Added #${issue.number} to the project ${inputs.projectId}`)

  if (inputs.projectFieldIdLastCalledAt) {
    await updateProjectFieldDateValue(octokit, {
      itemId: addIssueToProjectMutation.itemId,
      projectId: inputs.projectId,
      fieldId: inputs.projectFieldIdLastCalledAt,
      date: new Date(),
    })
    core.info(`Updated the last-called-at field to today`)
  }

  if (inputs.projectFieldIdCalls) {
    core.info(`The calls field is ${addIssueToProjectMutation.calls ?? 'not set'}`)
    const cumulativeCalls = (addIssueToProjectMutation.calls ?? 0) + 1
    await updateProjectFieldNumberValue(octokit, {
      itemId: addIssueToProjectMutation.itemId,
      projectId: inputs.projectId,
      fieldId: inputs.projectFieldIdCalls,
      number: cumulativeCalls,
    })
    core.info(`Updated the calls field to ${cumulativeCalls}`)
  }

  if (inputs.projectFieldIdCostUsd) {
    core.info(`The cost-usd field is ${addIssueToProjectMutation.costUsd ?? 'not set'}`)
    const cumulativeCostUsd = (addIssueToProjectMutation.costUsd ?? 0) + execution.costUsd
    await updateProjectFieldNumberValue(octokit, {
      itemId: addIssueToProjectMutation.itemId,
      projectId: inputs.projectId,
      fieldId: inputs.projectFieldIdCostUsd,
      number: cumulativeCostUsd,
    })
    core.info(`Updated the cost-usd field to ${cumulativeCostUsd} USD`)
  }
}
