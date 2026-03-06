import * as core from '@actions/core'
import { getContext, getOctokit } from './github.js'
import { run } from './run.js'

try {
  await run(
    {
      executionFile: core.getInput('execution-file', { required: true }),
      projectId: core.getInput('project-id') || undefined,
      projectFieldIdCostUsd: core.getInput('project-field-id-cost-usd') || undefined,
    },
    getOctokit(),
    await getContext(),
  )
} catch (e) {
  core.setFailed(e instanceof Error ? e : String(e))
  console.error(e)
}
