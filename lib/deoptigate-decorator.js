'use strict'

const {
    window
  , OverviewRulerLane
  , Range
  , MarkdownString
  , Position
  , Uri
} = require('vscode')

const deoptigateHoverMessage = require('./deoptigate-hover-message')

const severityOptions = {
    borderWidth: '2px'
  , borderStyle: 'none none dotted none'
  , overviewRulerLane: OverviewRulerLane.Right
  , gutterIconSize: '8px 8px'
}
const highSeverityDecorator = window.createTextEditorDecorationType(
  Object.assign({}, severityOptions, {
    overviewRulerColor: 'red'
  , light: { borderColor: 'red' }
  , dark: { borderColor: 'red' }
  , gutterIconPath: Uri.parse('https://upload.wikimedia.org/wikipedia/commons/7/78/Red_Triangle.png')
}))

const midSeverityDecorator = window.createTextEditorDecorationType(
  Object.assign({}, severityOptions, {
    overviewRulerColor: 'blue'
  , light: { borderColor: 'blue' }
  , dark: { borderColor: 'blue' }
  , gutterIconPath: Uri.parse('https://upload.wikimedia.org/wikipedia/commons/a/a0/Blue_triangle.svg')
}))

const lowSeverityDecorator = window.createTextEditorDecorationType(
  Object.assign({}, severityOptions, {
    overviewRulerColor: 'green'
  , light: { borderColor: 'green' }
  , dark: { borderColor: 'lightgreen' }
  , gutterIconPath: Uri.parse('https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Green_triangle.svg/270px-Green_triangle.svg.png')
}))

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
      const details = deoptigateHoverMessage(deopt)
      const pos = new Position(deopt.line - 1, deopt.column - 1)
      const offset = this._activeEditor.document.offsetAt(pos)
      markers.push({ start: offset, end: offset + 1, details, severity: deopt.severity })
    }

    return markers
  }

  _applyMarkers() {
    if (this._markers == null || this._activeEditor == null) return

    const highDecorations = []
    const midDecorations = []
    const lowDecorations = []
    for (const marker of this._markers) {
      const start = this._activeEditor.document.positionAt(marker.start)
      const end = this._activeEditor.document.positionAt(marker.end)
      const decorations = (
          marker.severity === 3 ? highDecorations
        : marker.severity === 2 ? midDecorations
        : lowDecorations
      )
      decorations.push({
          range: new Range(start, end)
        , hoverMessage: new MarkdownString(marker.details)
      })
    }
    this._activeEditor.setDecorations(highSeverityDecorator, highDecorations)
    this._activeEditor.setDecorations(midSeverityDecorator, midDecorations)
    this._activeEditor.setDecorations(lowSeverityDecorator, lowDecorations)
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
