import * as fs from 'node:fs/promises'
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
  const steps = ExecutionSchema.parse(JSON.parse(executionFileContent))
  const lastStep = steps.pop()
  if (!lastStep || lastStep.total_cost_usd === undefined) {
    throw new Error(`Invalid execution file`)
  }
  return {
    costUsd: lastStep.total_cost_usd,
  }
}
