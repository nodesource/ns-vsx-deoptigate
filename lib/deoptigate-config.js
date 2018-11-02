'use strict'

const { EventEmitter } = require('events')

/**
 * Contains configuration options for deptigate
 *
 * @class DeoptigateConfig
 */
class DeoptigateConfig extends EventEmitter {
  constructor(globalState) {
    super()
    this._globalState = globalState
    this._deserialize()
  }

  _onsettingChange(propName) {
    this._serialize()
    this._emitChange(propName)
  }

  _emitChange(propName) {
    this.emit('change')
    this.emit(`change:${propName}`)
  }

  _serialize() {
    this._globalState.update('deoptigate', JSON.stringify({
        showDeoptimizations : this.showDeoptimizations
      , showInlineCaches    : this.showInlineCaches
      , showOptimizations   : this.showOptimizations
      , showLowSeverities   : this.showLowSeverities
    }))
  }

  _deserialize() {
    const currentJSON = this._globalState.get('deoptigate')
    const currentConf = currentJSON == null ? {} : JSON.parse(currentJSON)
    const conf = Object.assign(DeoptigateConfig.DefaultConf, currentConf)

    this._showLowSeverities   = conf.showLowSeverities
    this._showDeoptimizations = conf.showDeoptimizations
    this._showOptimizations   = conf.showOptimizations
    this._showInlineCaches    = conf.showInlineCaches
  }

  /**
   * Toggles the @see DeoptigateConfig#showLowSeverities config setting.
   */
  toggleLowSeverities() {
    this._showLowSeverities = !this._showLowSeverities
    this._onsettingChange('showLowSeverities')
  }
  /**
   * Toggles the @see DeoptigateConfig#showInlineCaches config setting.
   */
  toggleInlineCaches() {
    this._showInlineCaches = !this._showInlineCaches
    this._onsettingChange('showInlineCaches')
  }
  /**
   * Toggles the @see DeoptigateConfig#showDeoptimizations config setting.
   */
  toggleDeoptimizations() {
    this._showDeoptimizations = !this._showDeoptimizations
    this._onsettingChange('showDeoptimizations')
  }
  /**
   * Toggles the @see DeoptigateConfig#showOptimizations config setting.
   */
  toggleOptimizations() {
    this._showOptimizations = !this._showOptimizations
    this._onsettingChange('showOptimizations')
  }

  /**
   * If `true` low severity Deoptimizations and ICs are annotated in the editor
   *
   * @readonly
   * @default false
   * @returns {boolean}
   */
  get showLowSeverities() {
    return this._showLowSeverities
  }

  /**
   * If `true` Deoptimizations are annotated in the editor.
   *
   * @readonly
   * @default true
   * @returns {boolean}
   */
  get showDeoptimizations() {
    return this._showDeoptimizations
  }

  /**
   * If `true` Optimizations are annotated in the editor.
   *
   * @readonly
   * @default false
   * @returns {boolean}
   */
  get showOptimizations() {
    return this._showOptimizations
  }

  /**
   * If `true` Inline Caches are annotated in the editor.
   *
   * @readonly
   * @default true
   * @returns {boolean}
   */
  get showInlineCaches() {
    return this._showInlineCaches
  }

  /**
   * Default deoptigate config.
   *
   * @readonly {Object}
   * @static
   */
  static get DefaultConf() {
    return {
        showLowSeverities   : false
      , showDeoptimizations : true
      , showOptimizations   : false
      , showInlineCaches    : true
    }
  }
}

module.exports = DeoptigateConfig
