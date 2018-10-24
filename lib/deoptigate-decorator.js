'use strict'

const {
    window
  , OverviewRulerLane
  , Range
  , MarkdownString
  , Position
} = require('vscode')

const deoptigateHoverMessage = require('./deoptigate-hover-message')

const markerDecorator = window.createTextEditorDecorationType({
    cursor: 'pointer'
  , borderWidth: '2px'
  , borderStyle: 'none none dotted none'
  , overviewRulerColor: 'red'
  , overviewRulerLane: OverviewRulerLane.Right
  , light: { borderColor: 'red' }
  , dark: { borderColor: 'red' }
})

class DeoptigateDecorator {
  constructor(context) {
    this._bind()
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
    this._markers = this._calculateDeoptMarkers(info)
    if (this._activeEditor != null) this._applyMarkers()
  }

  _calculateDeoptMarkers(info) {
    const markers = []
    const filename = this._activeEditor.document.fileName
    const fileInfo = info.get(filename)
    if (fileInfo == null || fileInfo.deopts.length === 0) return
    for (const deopt of fileInfo.deopts.values()) {
      const details = deoptigateHoverMessage(deopt)
      const pos = new Position(deopt.line - 1, deopt.column - 1)
      const offset = this._activeEditor.document.offsetAt(pos)
      markers.push({ start: offset, end: offset + 1, details })
    }

    return markers
  }

  _applyMarkers() {
    if (this._markers == null || this._activeEditor == null) return

    const decorations = this._markers.map(x => {
      const start = this._activeEditor.document.positionAt(x.start)
      const end = this._activeEditor.document.positionAt(x.end)
      return {
          range: new Range(start, end)
        , hoverMessage: new MarkdownString(x.details)
      }
    })
    this._activeEditor.setDecorations(markerDecorator, decorations)
  }

  _ondidChangeEditor(editor) {
    this._activeEditor = editor
    this._applyMarkers()
  }

  _ondidChangeDocument(event) {
    this._applyMarkers()
  }

}

module.exports = DeoptigateDecorator
