'use strict'

const { window, StatusBarAlignment } = require('vscode')
const PRIORITY = 1000

class DeoptigateStatusbar {
  constructor() {
    this._status = window.createStatusBarItem(
      StatusBarAlignment.Left, PRIORITY
    )
    this._status.command = 'deoptigate:toggle-summary'
  }

  update({ severeSummaries }) {
    const severeDeoptsCount = severeSummaries.reduce((sum, x) => sum + x.deoptSeverities[3], 0)
    if (severeDeoptsCount === 0) return this._status.hide()
    this._status.text = `🚫 ${severeDeoptsCount} critical deopts`
    this._status.show()
  }
}

module.exports = DeoptigateStatusbar
