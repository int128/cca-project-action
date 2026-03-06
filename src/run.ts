import * as core from '@actions/core'
import type { Octokit } from '@octokit/action'
import type { Context } from './github.js'
import { getCurrentIssue } from './issue.js'

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
}
