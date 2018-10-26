'use strict'

const { commands, Uri, window, workspace } = require('vscode')

const DeoptigateWatcher = require('./lib/deoptigate-watcher')
const DeoptigateProcessor = require('./lib/deoptigate-processor')
const DeoptigateSummaryView = require('./lib/deoptigate-summary-view')
const DeoptigateStatusbar = require('./lib/deoptigate-statusbar')
const DeoptigateDecorator = require('./lib/deoptigate-decorator')
const openDeoptigatePage = require('./lib/deoptigate-open-page')

async function openFile(fullPath) {
  const uri = Uri.parse(`file://${fullPath}`)
  try {
    await commands.executeCommand('vscode.open', uri)
  } catch (err) {
    window.showErrorMessage(`Unable to open ${fullPath}\n`, err)
  }
}

function activate(context) {
  const workspaceRoot = workspace.workspaceFolders[0]
  // TODO: wait for workspace to open and then complete activation
  if (workspaceRoot == null) return
  const projectRoot = workspaceRoot.uri.fsPath
  const watcher = new DeoptigateWatcher()
  const deoptigateProcessor = new DeoptigateProcessor(projectRoot)
  const summaryView = new DeoptigateSummaryView()
  const statusbar = new DeoptigateStatusbar()
  const decorator = new DeoptigateDecorator(context)

  const showSummaryCommand =
    commands.registerCommand(
        'deoptigate:toggle-summary'
      , () => summaryView.toggle()
    )
  context.subscriptions.push(showSummaryCommand)

  function ondeoptigateUpdate({ info, logFile }) {
    const res = deoptigateProcessor.process(info)
    summaryView.update(res, { projectRoot, logFile })
    statusbar.update(res)
    decorator.update(info)
  }

  watcher
    .on('error', err => window.showErrorMessage(`Log file watcher error\n`, err))
    .on('update', ondeoptigateUpdate.bind(deoptigateProcessor))

  summaryView
    .on('open-file', openFile)
    .on('open-deoptigate', ({ logFile, projectRoot }) => openDeoptigatePage(logFile, projectRoot))
}

function deactivate() {}

module.exports = { activate, deactivate }
