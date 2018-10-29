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
} = require('./deoptigate-hover-message')

const {
    highSeverityDeoptDecorator
  , midSeverityDeoptDecorator
  , lowSeverityDeoptDecorator
  , highSeverityIcDecorator
  , midSeverityIcDecorator
  , lowSeverityIcDecorator
} = require('./deoptigate-decorators')

class DeoptigateDecorator {
  constructor(context) {
    this._bind()
    this._info = null
    this._markers = null
    this._activeEditor = window.activeTextEditor

    window.onDidChangeActiveTextEditor(this._ondidChangeEditor, null, context.subscriptions)
    window.onDidChangeActiveTextEditor(this._ondidChangeDocument, null, context.subscriptions)
  }

  _bind() {
    this._ondidChangeEditor = this._ondidChangeEditor.bind(this)
    this._ondidChangeDocument = this._ondidChangeDocument.bind(this)
  }

  update(info) {
    this._info = info
    if (this._activeEditor != null) {
      this._markers = this._calculateDeoptMarkers(info)
      this._applyMarkers()
    }
  }

  _calculateDeoptMarkers(info) {
    const markers = []
    const filename = this._activeEditor.document.fileName
    const fileInfo = info.get(filename)
    if (fileInfo == null || fileInfo.deopts.length === 0) return []
    for (const deopt of fileInfo.deopts.values()) {
      const details = deoptHoverMessage(deopt)
      const pos = new Position(deopt.line - 1, deopt.column - 1)
      const offset = this._activeEditor.document.offsetAt(pos)
      markers.push({ start: offset, end: offset + 1, details, severity: deopt.severity, type: 'deopt' })
    }
    for (const ic of fileInfo.ics.values()) {
      const details = icHoverMessage(ic)
      const pos = new Position(ic.line - 1, ic.column - 1)
      const offset = this._activeEditor.document.offsetAt(pos)
      markers.push({ start: offset, end: offset + 1, details, severity: ic.severity, type: 'ic' })
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
  }

  _ondidChangeEditor(editor) {
    this._activeEditor = editor
    console.log('changed editor')
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
