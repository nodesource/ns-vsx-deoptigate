'use strict'

const {
    severitySurrounds
  , linkLabel
  , deoptigateSupportRoot
} = require('./deoptigate-hover-message.common')

const {
    nameIcState
  , severityIcState
} = require('deoptigate/lib/log-processing/ic-state')

const icTableHeader = `
| Old State | New State | Key  | Map     |
| --------- | --------- | ---- | ------- |`

const icStateLinks = new Map([
    [ 'premonomorphic', `${deoptigateSupportRoot}/ic-premonomorphic` ]
  , [ 'recompute handler', `${deoptigateSupportRoot}/ic-recompute` ]
  , [ 'monomorphic', `${deoptigateSupportRoot}/ic-monomorphic` ]
  , [ 'polymorphic', `${deoptigateSupportRoot}/ic-polymorphic` ]
  , [ 'megamorphic', `${deoptigateSupportRoot}/ic-megamorphic` ]
])

function icRow(update) {
  const {
      oldState
    , newState
    , key
    , map
  } = update

  const oldStateName = nameIcState(oldState)
  const linkedOldState = linkLabel(icStateLinks, oldStateName)
  const severityOldState = severityIcState(oldState)
  const oldStateMarkdown = severitySurrounds[severityOldState - 1](linkedOldState)

  const newStateName = nameIcState(newState)
  const linkedNewState = linkLabel(icStateLinks, newStateName)
  const severityNewState = severityIcState(newState)
  const newStateMarkdown = severitySurrounds[severityNewState - 1](linkedNewState)

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
