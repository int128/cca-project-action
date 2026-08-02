import * as fs from 'node:fs/promises'
import * as core from '@actions/core'
import * as z from 'zod'

const Execution = z.array(
  z.looseObject({
    type: z.string(),
    message: z
      .looseObject({
        content: z
          .array(
            z.looseObject({
              text: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    result: z.string().optional(),
    total_cost_usd: z.number().optional(),
  }),
)

export type Execution = z.infer<typeof Execution>

export const parseExecutionFile = async (executionFilePath: string | undefined): Promise<Execution | null> => {
  if (!executionFilePath) {
    core.info(`No execution file provided`)
    return null
  }
  core.info(`Parsing the execution file: ${executionFilePath}`)
  try {
    const executionFileContent = await fs.readFile(executionFilePath, 'utf-8')
    return Execution.parse(JSON.parse(executionFileContent))
  } catch (error) {
    core.warning(`Invalid execution file: ${executionFilePath}: ${error}`)
    return null
  }
}

export const getCostUsdFromExecution = (execution: Execution | null): number | null => {
  const lastStep = execution?.at(-1)
  if (lastStep?.total_cost_usd !== undefined) {
    return lastStep.total_cost_usd
  }
  return null
}
