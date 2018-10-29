'use strict'

const deoptigateSupportRoot = 'https://nodesource.com/support/deoptigate'

const severitySurrounds = [
    s => `_${s}_`
  , s => s
  , s => `**${s}**`
]

function linkLabel(links, label) {
  if (!links.has(label)) return label
  return `[${label}](${links.get(label)})`
}

module.exports = {
    severitySurrounds
  , linkLabel
  , deoptigateSupportRoot
}
