'use strict'

const tableHeader = `
| Timestamp | Reason | Bailout | Inlined |
| --------- | ------ | ------- | ------- |`

const bailoutSurrounds = [
    s => `_${s}_`
  , s => s
  , s => `**${s}**`
]

function deoptRow(info) {
const {
      inlined
    , bailoutType
    , deoptReason
    , timestamp
    , severity
  } = info
  const bailoutSurround = bailoutSurrounds[severity - 1]
  const timeStampMs = (timestamp / 1E3).toFixed()

  return (`
| ${timeStampMs}ms | ${bailoutSurround(bailoutType)}` +
`| ${deoptReason} | _${inlined ? 'yes' : 'no'}_ |`
  )
}

function deoptHoverMessage(deopt) {
  return `
### Deoptimizations
${tableHeader}${deopt.updates.map(deoptRow).join('')}
`
}

module.exports = deoptHoverMessage
