'use strict'

const {
    window
  , Range
  , MarkdownString
  , Position
} = require('vscode')

const {
    deoptHoverMessage
  , icHoverMessage
  , optHoverMessage
} = require('./deoptigate-hover-message')

const {
    highSeverityDeoptDecorator
  , midSeverityDeoptDecorator
  , lowSeverityDeoptDecorator
  , highSeverityIcDecorator
  , midSeverityIcDecorator
  , lowSeverityIcDecorator
  , highSeverityOptDecorator
  , midSeverityOptDecorator
  , lowSeverityOptDecorator
} = require('./deoptigate-decorators')

const LOW_SEVERITY_THRESHOLD = 1

class DeoptigateDecorator {
  constructor(context, deoptigatorConfig) {
    this._config = deoptigatorConfig
    this._bind()
    this._info = null
    this._markers = null
    this._activeEditor = window.activeTextEditor

    window.onDidChangeActiveTextEditor(this._ondidChangeEditor, null, context.subscriptions)
    window.onDidChangeActiveTextEditor(this._ondidChangeDocument, null, context.subscriptions)
    this._subscribeConfigChanges()
  }

  _bind() {
    this._ondidChangeEditor = this._ondidChangeEditor.bind(this)
    this._ondidChangeDocument = this._ondidChangeDocument.bind(this)
    this._onrelevantConfigChanged = this._onrelevantConfigChanged.bind(this)
  }

  _subscribeConfigChanges() {
    this._config
      .on('change:showLowSeverities', this._onrelevantConfigChanged)
      .on('change:showInlineCaches', this._onrelevantConfigChanged)
      .on('change:showDeoptimizations', this._onrelevantConfigChanged)
      .on('change:showOptimizations', this._onrelevantConfigChanged)
  }

  update(info) {
    this._info = info
    if (this._activeEditor != null) {
      this._markers = this._calculateMarkers(info)
      this._applyMarkers()
    }
  }

  _pushMarkers(markers, values, type, highSeverityOnly) {
    const hoverMessage = (
        type === 'ic' ? icHoverMessage
      : type === 'deopt' ? deoptHoverMessage
      : optHoverMessage
    )
    for (const val of values) {
      const severity = val.severity
      if (highSeverityOnly && severity <= LOW_SEVERITY_THRESHOLD) continue
      const details = hoverMessage(val)
      const pos = new Position(val.line - 1, val.column - 1)
      const offset = this._activeEditor.document.offsetAt(pos)
      markers.push({ start: offset, end: offset + 1, details, severity, type })
    }
  }

  _calculateMarkers(info) {
    const markers = []
    const filename = this._activeEditor.document.fileName
    const fileInfo = info.get(filename)
    if (fileInfo == null || fileInfo.deopts.length === 0) return []

    const highSeverityOnly = !this._config.showLowSeverities

    if (this._config.showDeoptimizations) {
      this._pushMarkers(markers, fileInfo.deopts.values(), 'deopt', highSeverityOnly)
    }
    if (this._config.showInlineCaches) {
      this._pushMarkers(markers, fileInfo.ics.values(), 'ic', highSeverityOnly)
    }
    if (this._config.showOptimizations) {
      this._pushMarkers(markers, fileInfo.codes.values(), 'opt', highSeverityOnly)
    }

    return markers
  }

  _applyMarkers() {
    if (this._markers == null || this._activeEditor == null) return

    const highDeoptDecorations = []
    const midDeoptDecorations = []
    const lowDeoptDecorations = []

    const highIcDecorations = []
    const midIcDecorations = []
    const lowIcDecorations = []

    const highOptDecorations = []
    const midOptDecorations = []
    const lowOptDecorations = []

    for (const marker of this._markers) {
      const start = this._activeEditor.document.positionAt(marker.start)
      const end = this._activeEditor.document.positionAt(marker.end)
      let decorations
      if (marker.type === 'deopt') {
        decorations = (
            marker.severity === 3 ? highDeoptDecorations
          : marker.severity === 2 ? midDeoptDecorations
          : lowDeoptDecorations
        )
      } else if (marker.type === 'ic') {
        decorations = (
            marker.severity === 3 ? highIcDecorations
          : marker.severity === 2 ? midIcDecorations
          : lowIcDecorations
        )
      } else if (marker.type === 'opt') {
        decorations = (
            marker.severity === 3 ? highOptDecorations
          : marker.severity === 2 ? midOptDecorations
          : lowOptDecorations
        )
      }
      var hoverMessage = new MarkdownString(marker.details)
      hoverMessage.isTrusted = true
      decorations.push({ range: new Range(start, end), hoverMessage })
    }
    this._activeEditor.setDecorations(highSeverityDeoptDecorator, highDeoptDecorations)
    this._activeEditor.setDecorations(midSeverityDeoptDecorator, midDeoptDecorations)
    this._activeEditor.setDecorations(lowSeverityDeoptDecorator, lowDeoptDecorations)

    this._activeEditor.setDecorations(highSeverityIcDecorator, highIcDecorations)
    this._activeEditor.setDecorations(midSeverityIcDecorator, midIcDecorations)
    this._activeEditor.setDecorations(lowSeverityIcDecorator, lowIcDecorations)

    this._activeEditor.setDecorations(highSeverityOptDecorator, highOptDecorations)
    this._activeEditor.setDecorations(midSeverityOptDecorator, midOptDecorations)
    this._activeEditor.setDecorations(lowSeverityOptDecorator, lowOptDecorations)
  }

  _onrelevantConfigChanged() {
    if (this._info != null) this.update(this._info)
  }

  _ondidChangeEditor(editor) {
    this._activeEditor = editor
    // Update even if we already calculated markers since they
    // were calculated for the previous editor document
    if (this._info != null) this.update(this._info)
  }

  _ondidChangeDocument(event) {
    if (this._info == null || !event.document.isDirty) return
    // when the document changes our markers go out of date
    // therefore we'll just show a warning since we cannot fix that
    window.showWarningMessage(
      'deoptigate markers don\'t refresh after document changes.'
    )
  }
}

module.exports = DeoptigateDecorator
