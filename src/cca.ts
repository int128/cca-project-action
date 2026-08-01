import * as fs from 'node:fs/promises'
import * as core from '@actions/core'
import * as z from 'zod'

const ExecutionSchema = z.array(
  z.object({
    total_cost_usd: z.number().optional(),
  }),
)

export type Execution = {
  costUsd: number
}

export const parseExecutionFile = async (executionFilePath: string): Promise<Execution> => {
  const executionFileContent = await fs.readFile(executionFilePath, 'utf-8')
  const executionFileObject = JSON.parse(executionFileContent)

  core.summary.addRaw(`<details>`)
  core.summary.addCodeBlock(JSON.stringify(executionFileObject, null, 2), 'json')
  core.summary.addRaw(`</details>`)
  await core.summary.write()

  const steps = ExecutionSchema.parse(executionFileObject)
  const lastStep = steps.pop()
  if (!lastStep || lastStep.total_cost_usd === undefined) {
    throw new Error(`Invalid execution file`)
  }
  return {
    costUsd: lastStep.total_cost_usd,
  }
}

export const parseExecutionFileSafe = async (executionFilePath: string | undefined): Promise<Execution | null> => {
  if (!executionFilePath) {
    core.info(`No execution file provided`)
    return null
  }
  core.info(`Parsing the execution file: ${executionFilePath}`)
  try {
    return await parseExecutionFile(executionFilePath)
  } catch (error) {
    core.warning(`Invalid execution file: ${executionFilePath}: ${error}`)
    return null
  }
}
