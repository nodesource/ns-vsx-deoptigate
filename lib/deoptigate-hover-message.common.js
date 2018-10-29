'use strict'

const severitySurrounds = [
    s => `_${s}_`
  , s => s
  , s => `**${s}**`
]

module.exports = { severitySurrounds }
