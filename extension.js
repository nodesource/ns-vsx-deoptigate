'use strict'

const path = require('path')
const DeoptigateWatcher = require('./lib/deoptigate-watcher')
const DeoptigateProcessor = require('./lib/deoptigate-processor')
const DeoptigateSummaryView = require('./lib/deoptigate-summary-view')

function activate(context) {
  // TODO: figure out where we want the log files and how to make the
  // run task store them there.
  const root = path.join(__dirname, 'tmp')
  const projectRoot = path.join(__dirname, '..', 'ns-vsx-deoptigate.samples')

  const watcher = new DeoptigateWatcher(root)
  const deoptigateProcessor = new DeoptigateProcessor(projectRoot)
  const summaryView = new DeoptigateSummaryView()

  function ondeoptigateUpdate(info) {
    const res = deoptigateProcessor.process(info)
    summaryView.update(res)
  }

  watcher
    .on('error', console.error)
    .on('update', ondeoptigateUpdate.bind(deoptigateProcessor))
}

function deactivate() {}

module.exports = { activate, deactivate }
