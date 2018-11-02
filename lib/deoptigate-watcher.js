'use strict'

const EventEmitter = require('events')
const { workspace } = require('vscode')

// TODO: main deoptigate API should expose those functions
const { deoptigateLog } = require('deoptigate/deoptigate.log')

class DeoptigateWatcher extends EventEmitter {
  constructor() {
    super()
    this._bind()

    // TODO: clear when log file is removed
    // Possibly allow removal via the summary view or the status bar
    const watcher = workspace.createFileSystemWatcher('**/deoptigate.log', false, false, true)
    watcher.onDidCreate(this._onfileAdded)
    watcher.onDidChange(this._onfileChanged)
  }

  _bind() {
    this._onfileChanged = this._onfileChanged.bind(this)
    this._onfileAdded = this._onfileAdded.bind(this)
  }

  _onfileChanged(file) {
    this._onlogUpdate(file)
  }

  _onfileAdded(file) {
    this._onlogUpdate(file)
  }

  async _onlogUpdate(file) {
    let logFile
    let info
    try {
      logFile = file.fsPath
      info = await deoptigateLog(logFile)
    } catch (err) {
      return this.emit('error', err)
    }
    this.emit('update', { info, logFile })
  }
}

module.exports = DeoptigateWatcher
