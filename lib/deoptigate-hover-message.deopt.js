'use strict'

const { severitySurrounds } = require('./deoptigate-hover-message.common')

const deoptTableHeader = `
| Timestamp | Reason | Bailout | Inlined |
| --------- | ------ | ------- | ------- |`

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

  return (`
| ${timeStampMs}ms | ${bailoutSurround(bailoutType)}` +
`| ${deoptReason} | _${inlined ? 'yes' : 'no'}_ |`
  )
}

function deoptHoverMessage(deopt) {
  return `
### Deoptimizations
${deoptTableHeader}${deopt.updates.map(deoptRow).join('')}
`
}

module.exports = deoptHoverMessage
