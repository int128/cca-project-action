import * as core from '@actions/core'
import type { Execution } from './cca.js'

export const writeSummary = (execution: Execution) => {
  core.summary.addHeading('cca-usage-action summary', 2)

  for (const [i, step] of execution.entries()) {
    core.summary.addHeading(`(${i + 1}) ${step.type}`, 3)
    if (step.result !== undefined) {
      core.summary.addRaw('<p>')
      core.summary.addRaw(step.result)
      core.summary.addRaw('</p>')
    }
    if (step.message?.content) {
      for (const message of step.message.content) {
        if (message.text) {
          core.summary.addRaw('<p>')
          core.summary.addRaw(message.text)
          core.summary.addRaw('</p>')
        }
      }
    }
    core.summary.addRaw('<details>')
    core.summary.addCodeBlock(JSON.stringify(step, null, 2), 'json')
    core.summary.addRaw('</details>')
  }
}
