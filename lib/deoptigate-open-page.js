'use strict'

const { window } = require('vscode')

// TODO: expose this API from deoptigate properly
const createPage = require('deoptigate/app/lib/create-page')
const { savePage, saveEntry } = require('deoptigate/app/lib/save-parts')
const { logToJSON } = require('deoptigate/deoptigate.log')
const open = require('opn')

async function openPage(logFile, root) {
  try {
    // For now reparsing logFile since that's easier, but if performance
    // becomes a concern we should use the groupedInfo as a starting
    // point instead
    const json = await logToJSON(logFile, { root })
    const html = createPage()
    const indexHtml = savePage(html)
    saveEntry(json)
    await open(indexHtml, { wait: false })
  } catch (err) {
    window.showErrorMessage(`Unable to open deoptigate\n`, err)
  }
}

module.exports = openPage
