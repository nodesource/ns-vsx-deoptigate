'use strict'
const { window, ViewColumn } = require('vscode')
const { EventEmitter } = require('events')
const fs = require('fs')
const path = require('path')
const tachyonsCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'tachyons.min.css'))

const severityClassNames = [
    'green i'
  , 'blue '
  , 'red b '
]
function coloredTds(arr) {
  return arr.map((x, idx) => {
    const className = x > 0
      ? severityClassNames[idx] + ' tr '
      : ' i gray tr '
    return `<td class=${className}>${x}</td>`
  }).join('\n')
}

function bySeverityScoreDesc(s1, s2) {
  return s1.severityScore < s2.severityScore ? 1 : -1
}

class DeoptigateSummaryView extends EventEmitter {
  constructor() {
    super()
    this._projectRoot = null
    this._logFile = null
    this._panel = null
    this._panelDisposed = true
    this._html = ''

    this._bind()
  }

  _bind() {
    this._onpanelDisposed = this._onpanelDisposed.bind(this)
    this._onwebviewMessage = this._onwebviewMessage.bind(this)
  }

  update({ summaries, severeSummaries }, { projectRoot, logFile }) {
    this._projectRoot = projectRoot
    this._logFile = logFile
    this._html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Deoptigate Results</title>
          <style>${tachyonsCss}</style>
      </head>
      <body>
        <div>
          <input
            type='button'
            id='open-deoptigate'
            value='Open Deoptigate'
            class='mal2 mb1 pointer'>
          <table>
            ${this._renderHeader()}
            <tbody>
              ${this._renderSummaries(severeSummaries.sort(bySeverityScoreDesc))}
            </tbody>
          </table>
        </div>
        <script>
          const vscode = acquireVsCodeApi()
          function onanchorClick(e) {
            const target = e.target
            const path = target.dataset.path
            vscode.postMessage({
              command: 'open-file', path
            })
          }

          function onopenDeoptigateClick(e) {
            vscode.postMessage({ command: 'open-deoptigate' })
          }

          ;(function setupAnchorClicks() {
            const anchors = document.getElementsByClassName('deoptigate-item')
            console.log(anchors)
            for (const anchor of anchors) {
              anchor.addEventListener('click', onanchorClick)
            }
          })()
          ;(function setupOpenDeoptigateClick() {
            const button = document.getElementById('open-deoptigate')
            console.log(button)
            button.addEventListener('click', onopenDeoptigateClick)
          })()
        </script>
      </body>
    `
    if (!this._panelDisposed) this._panel.webview.html = this._html
  }

  toggle() {
    if (this._panelDisposed) {
      this._panel = window.createWebviewPanel(
          'deoptigate:results'
        , 'Deoptigate Results'
        , ViewColumn.Active
        , { enableScripts: true }
      )
      this._panel.webview.html = this._html
      this._panel.onDidDispose(this._onpanelDisposed)
      this._panelDisposed = false
      this._panel.webview.onDidReceiveMessage(this._onwebviewMessage)
    } else if (this._panel.visible) {
      this._panel.dispose()
    } else {
      this._panel.reveal()
    }
  }

  _onpanelDisposed() {
    this._panelDisposed = true
  }

  _renderHeader() {
    const topHeaderClass = 'tc header-row pt2 pb1 '
    const subHeaderClass = 'pa1 pl2 pr2 subhead'

    return `
      <thead>
        <tr>
          <td class=${topHeaderClass + ' '}>File</td>
          <td colSpan='3' class=${topHeaderClass}>Opts</td>
          <td colSpan='3' class=${topHeaderClass}>Deopts</td>
          <td colSpan='3' class=${topHeaderClass}>ICs Caches</td>
        </tr>
        <tr>
          <td class=${subHeaderClass} />
          <td class=${subHeaderClass}>Optimized</td>
          <td class=${subHeaderClass}>Optimizable</td>
          <td class=${subHeaderClass}>Compiled</td>
          <td class=${subHeaderClass}>Sev 1</td>
          <td class=${subHeaderClass}>Sev 2</td>
          <td class=${subHeaderClass}>Sev 3</td>
          <td class=${subHeaderClass}>Sev 1</td>
          <td class=${subHeaderClass}>Sev 2</td>
          <td class=${subHeaderClass}>Sev 3</td>
        </tr>
      </thead>
    `
  }

  _renderSummaries(summaries) {
    let s = ''
    for (const summary of summaries) {
      s += this._renderSummary(summary)
    }
    return s
  }

  _renderSummary({ path, fullPath, deoptSeverities, icSeverities, codeStates }) {
    const codeColumns = coloredTds(codeStates.reverse())
    const deoptColumns = coloredTds(deoptSeverities.slice(1))
    const icColumns = coloredTds(icSeverities.slice(1))

    return `
      <tr class='normalrow'>
        <td class='underlined'>
          <a class='deoptigate-item pl2 pr2' href='#' data-path='${fullPath}'>
            ${path}
          </a>
        </td>
        ${codeColumns}
        ${deoptColumns}
        ${icColumns}
      </tr>
    `
  }

  _onwebviewMessage(msg) {
    switch (msg.command) {
      case 'open-file': {
        return this.emit('open-file', msg.path)
      }
      case 'open-deoptigate': {
        return this.emit('open-deoptigate', {
            projectRoot: this._projectRoot
          , logFile: this._logFile
        })
      }
      default: throw new Error(`Unknown command ${msg.command}`)
    }
  }
}

module.exports = DeoptigateSummaryView
