'use strict'

const { relative } = require('path')
const summarizeFile = require('deoptigate/lib/grouping/summarize-file')

class DeoptigateProcessor {
  constructor(projectRoot) {
    this._projectRoot = projectRoot
  }

  process(info) {
    const summaries = this._extractSummaries(info)
    const severeSummaries = summaries.filter(x => x.hasCriticalSeverities)
    return { summaries, severeSummaries }
  }

  _extractSummaries(info) {
    const summaries = []
    for (const [ fullPath, x ] of info) {
      const relativePath = relative(this._projectRoot, fullPath)
      const summary = summarizeFile(x)
      summaries.push(Object.assign(summary, {
          fullPath
        , path: relativePath
      }))
    }
    return summaries
  }
}

module.exports = DeoptigateProcessor
