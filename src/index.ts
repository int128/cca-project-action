import * as core from '@actions/core'
import { getContext, getOctokit } from './github.js'
import { run } from './run.js'

try {
  const outputs = await run(
    {
      executionFile: core.getInput('execution-file', { required: true }),
      projectId: core.getInput('project-id', { required: true }),
      projectFieldIdLastCalledAt: core.getInput('project-field-id-last-called-at') || undefined,
      projectFieldIdCalls: core.getInput('project-field-id-calls') || undefined,
      projectFieldIdCostUsd: core.getInput('project-field-id-cost-usd') || undefined,
    },
    getOctokit(),
    await getContext(),
  )
  if (outputs?.cumulativeCalls !== undefined) {
    core.info(`cumulative-calls: ${outputs.cumulativeCalls}`)
    core.setOutput('cumulative-calls', outputs.cumulativeCalls)
  }
  if (outputs?.cumulativeCostUsd !== undefined) {
    core.info(`cumulative-cost-usd: ${outputs.cumulativeCostUsd}`)
    core.setOutput('cumulative-cost-usd', outputs.cumulativeCostUsd)
  }
} catch (e) {
  core.setFailed(e instanceof Error ? e : String(e))
  console.error(e)
}
