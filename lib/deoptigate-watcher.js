'use strict'

const EventEmitter = require('events')
const chokidar = require('chokidar')

// TODO: main deoptigate API should expose those functions
const { deoptigateLog } = require('deoptigate/deoptigate.log')

class DeoptigateWatcher extends EventEmitter {
  constructor(rootDir) {
    super()
    this._bind()

    const p = rootDir + '/*.log'
    chokidar.watch(p, { persistent: false })
      .on('add', this._onfileAdded)
      .on('change', this._onfileChanged)
  }

  _bind() {
    this._onfileChanged = this._onfileChanged.bind(this)
    this._onfileAdded = this._onfileAdded.bind(this)
  }

  _onfileChanged(p) {
    this._onlogUpdate(p)
  }

  _onfileAdded(p) {
    this._onlogUpdate(p)
  }

  async _onlogUpdate(p) {
    try {
      // TODO: exclude file sources via flag to deoptigate
      const logInfo = await deoptigateLog(p)
      this.emit('update', logInfo)
    } catch (err) {
      this.emit('error', err)
    }
  }
}

module.exports = DeoptigateWatcher
