'use strict'

const { severitySurrounds } = require('./deoptigate-hover-message.common')
const { nameIcState, severityIcState } = require('deoptigate/lib/log-processing/ic-state')

const icTableHeader = `
| Old State | New State | Key  | Map     |
| --------- | --------- | ---- | ------- |`

function icRow(update) {
  const {
      oldState
    , newState
    , key
    , map
  } = update

  const oldStateName = nameIcState(oldState)
  const severityOldState = severityIcState(oldState)
  const oldStateMarkdown = severitySurrounds[severityOldState - 1](oldStateName)

  const newStateName = nameIcState(newState)
  const severityNewState = severityIcState(newState)
  const newStateMarkdown = severitySurrounds[severityNewState - 1](newStateName)

  const mapString = `0x${map}`

  return (`
| ${oldStateMarkdown} | ${newStateMarkdown} | **${key}** | ${mapString} |`
  )
}

function icHoverMessage(ic) {
  return `
### Inline Caches
${icTableHeader}${ic.updates.map(icRow).join('')}
`
}

module.exports = icHoverMessage
