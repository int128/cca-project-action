import * as core from '@actions/core'
import { getContext, getOctokit } from './github.js'
import { run } from './run.js'

try {
  await run(
    {
      projectId: core.getInput('project-id', { required: true }),
      projectFieldIdCostUsd: core.getInput('project-field-id-cost-usd'),
      executionFile: core.getInput('execution-file', { required: true }),
    },
    getOctokit(),
    await getContext(),
  )
} catch (e) {
  core.setFailed(e instanceof Error ? e : String(e))
  console.error(e)
}
