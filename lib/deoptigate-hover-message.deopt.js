'use strict'

const {
    severitySurrounds
  , linkLabel
  , deoptigateSupportRoot
} = require('./deoptigate-hover-message.common')

const deoptTableHeader = `
| Timestamp | Reason | Bailout | Inlined |
| --------- | ------ | ------- | ------- |`

const deoptReasonLinks = new Map([
    [ 'wrong map', `${deoptigateSupportRoot}/deopt-wrong-map` ]
  , [ 'wrong call target', `${deoptigateSupportRoot}/deopt-wrong-callt` ]
  , [ 'Insufficient type feedback for generic named access', `${deoptigateSupportRoot}/deopt-itf-named-access` ]
  , [ 'Insufficient type feedback for compare operation', `${deoptigateSupportRoot}/deopt-itf-comp-op` ]
  , [ 'not a Smi', `${deoptigateSupportRoot}/deopt-not-smi` ]
  , [ 'not a Number or Oddbal', `${deoptigateSupportRoot}/deopt-not-numoodd` ]
])

function deoptRow(info) {
  const {
      inlined
    , bailoutType
    , deoptReason
    , timestamp
    , severity
  } = info
  const bailoutSurround = severitySurrounds[severity - 1]
  const timeStampMs = (timestamp / 1E3).toFixed()

  const linkedReason = linkLabel(deoptReasonLinks, deoptReason)

  return (`
| ${timeStampMs}ms | ${bailoutSurround(bailoutType)}` +
`| ${linkedReason} | _${inlined ? 'yes' : 'no'}_ |`
  )
}

function deoptHoverMessage(deopt) {
  return `
### Deoptimizations
${deoptTableHeader}${deopt.updates.map(deoptRow).join('')}
`
}

module.exports = deoptHoverMessage
