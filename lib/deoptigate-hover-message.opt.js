'use strict'

const {
    severitySurrounds
  , linkLabel
  , deoptigateSupportRoot
} = require('./deoptigate-hover-message.common')
const {
    nameOptimizationState
} = require('deoptigate/lib/log-processing/optimization-state')

const optTableHeader = `
| Timestamp | Optimization State |
| --------- | ------------------ |`

const optStateLinks = new Map([
    [ 'optimizable', `${deoptigateSupportRoot}/opt-optimizable` ]
  , [ 'optimized', `${deoptigateSupportRoot}/opt-optimized` ]
])

function optRow(info) {
  const {
      state
    , timestamp
    , severity
  } = info
  const optStateSurround = severitySurrounds[severity - 1]
  const timeStampMs = (timestamp / 1E3).toFixed()

  const linkedState = linkLabel(optStateLinks, nameOptimizationState(state))

  return (`
| ${timeStampMs}ms | ${optStateSurround(linkedState)} |`
  )
}

function optHoverMessage(opt) {
  return `
### Optimizations
${optTableHeader}${opt.updates.map(optRow).join('')}
`
}

module.exports = optHoverMessage
