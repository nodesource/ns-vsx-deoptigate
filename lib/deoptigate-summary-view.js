'use strict'
const { window, ViewColumn } = require('vscode')

const severityClassNames = [
    'green i tc'
  , 'blue tc'
  , 'red b tc'
]
const underlineTdClass = ' pl2 pr2 underlined '

function coloredTds(arr) {
  return arr.map((x, idx) => {
    const className = x > 0
      ? severityClassNames[idx] + ' tr' + underlineTdClass
      : ' pl2 pr2 tc i gray' + underlineTdClass
    return `<td class=${className}>${x}</td>`
  }).join('\n')
}

class DeoptigateSummaryView {
  constructor() {
    this._panel = null
    this._panelDisposed = true
    this._html = ''

    this._bind()
  }

  _bind() {
    this._onpanelDisposed = this._onpanelDisposed.bind(this)
  }

  update({ summaries, severeSummaries }) {
    this._html = `
      <div>
        <link rel='stylesheet' type='text/css' href='https://raw.githubusercontent.com/tachyons-css/tachyons/master/css/tachyons.min.css'>
        <table>
          ${this._renderHeader()}
          <tbody>
            ${this._renderSummaries(severeSummaries)}
          </tbody>
        </table>
      </div>
    `
    if (!this._panelDisposed) this._panel.webview.html = this._html
  }

  toggle() {
    if (this._panelDisposed) {
      this._panel = window.createWebviewPanel(
          'deoptigate:results'
        , 'Deoptigate Results'
        , ViewColumn.Active
      )
      this._panel.webview.html = this._html
      this._panel.onDidDispose(this._onpanelDisposed)
      this._panelDisposed = false
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

  _renderSummary({ path, deoptSeverities, icSeverities, codeStates }) {
    const codeColumns = coloredTds(codeStates.reverse())
    const deoptColumns = coloredTds(deoptSeverities.slice(1))
    const icColumns = coloredTds(icSeverities.slice(1))

    // TODO: handle clicks and open appropriate file
    return `
      <tr class={'normalrow ' + selectedClass}>
        <td class='underlined'>
          <a className={'items pl2 pr2'} href='#'>
            ${path}
          </a>
        </td>
        ${codeColumns}
        ${deoptColumns}
        ${icColumns}
      </tr>
    `
  }
}

module.exports = DeoptigateSummaryView
