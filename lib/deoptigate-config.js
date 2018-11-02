'use strict'

const { EventEmitter } = require('events')

/**
 * Contains configuration options for deptigate
 *
 * @class DeoptigateConfig
 */
class DeoptigateConfig extends EventEmitter {
  constructor() {
    super()
    this._showLowSeverities = false
    this._showDeoptimizations = true
    this._showInlineCaches = true
  }

  _emitChange(propName) {
    this.emit('change')
    this.emit(`change:${propName}`)
  }

  /**
   * Toggles the @see DeoptigateConfig#showLowSeverities config setting.
   */
  toggleLowSeverities() {
    this._showLowSeverities = !this._showLowSeverities
    this._emitChange('showLowSeverities')
  }
  /**
   * Toggles the @see DeoptigateConfig#showInlineCaches config setting.
   */
  toggleInlineCaches() {
    this._showInlineCaches = !this._showInlineCaches
    this._emitChange('showInlineCaches')
  }
  /**
   * Toggles the @see DeoptigateConfig#showDeoptimizations config setting.
   */
  toggleDeoptimizations() {
    this._showDeoptimizations = !this._showDeoptimizations
    this._emitChange('showDeoptimizations')
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
   * If `true` Inline Caches are annotated in the editor.
   *
   * @readonly
   * @default true
   * @returns {boolean}
   */
  get showInlineCaches() {
    return this._showInlineCaches
  }
}

module.exports = DeoptigateConfig
