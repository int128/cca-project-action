import { describe, expect, it } from 'vitest'
import { parseExecutionFile } from '../src/cca.js'

describe('parseExecutionFile', () => {
  it('should parse execution file and return total cost USD', async () => {
    const execution = await parseExecutionFile(`${__dirname}/fixtures/execution_file.json`)
    expect(execution.costUsd).toBe(0.16649150000000001)
  })
})
