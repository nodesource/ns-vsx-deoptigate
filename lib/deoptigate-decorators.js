'use strict'

const { window, Uri, OverviewRulerLane } = require('vscode')

const severityOptions = {
    borderWidth: '2px'
  , borderStyle: 'none none dotted none'
  , overviewRulerLane: OverviewRulerLane.Right
  , gutterIconSize: '8px 8px'
}

const highSeverityOptions = Object.assign({}, severityOptions, {
    overviewRulerColor: 'red'
  , light: { borderColor: 'red' }
  , dark: { borderColor: 'red' }
})

const midSeverityOptions = Object.assign({}, severityOptions, {
    overviewRulerColor: 'blue'
  , light: { borderColor: 'blue' }
  , dark: { borderColor: 'blue' }
})

const lowSeverityOptions = Object.assign({}, severityOptions, {
    overviewRulerColor: 'green'
  , light: { borderColor: 'green' }
  , dark: { borderColor: 'lightgreen' }
})

const highSeverityDeoptDecorator = window.createTextEditorDecorationType(
  Object.assign({}, highSeverityOptions, {
    gutterIconPath: Uri.parse('https://upload.wikimedia.org/wikipedia/commons/7/78/Red_Triangle.png')
}))

const midSeverityDeoptDecorator = window.createTextEditorDecorationType(
  Object.assign({}, midSeverityOptions, {
    gutterIconPath: Uri.parse('https://upload.wikimedia.org/wikipedia/commons/a/a0/Blue_triangle.svg')
}))

const lowSeverityDeoptDecorator = window.createTextEditorDecorationType(
  Object.assign({}, lowSeverityOptions, {
    gutterIconPath: Uri.parse('https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Green_triangle.svg/270px-Green_triangle.svg.png')
}))

const highSeverityIcDecorator = window.createTextEditorDecorationType(
  Object.assign({}, highSeverityOptions, {
    gutterIconPath: Uri.parse('https://www.clker.com/cliparts/L/L/B/r/Q/4/red-phone-icon-hi.png')
}))

const midSeverityIcDecorator = window.createTextEditorDecorationType(
  Object.assign({}, midSeverityOptions, {
    gutterIconPath: Uri.parse('https://www.clker.com/cliparts/0/K/w/z/m/Q/blue-phone-md.png')
}))

const lowSeverityIcDecorator = window.createTextEditorDecorationType(
  Object.assign({}, lowSeverityOptions, {
    gutterIconPath: Uri.parse('https://upload.wikimedia.org/wikipedia/commons/8/8c/Green_Phone_Font-Awesome.svg')
}))


module.exports = { 
    highSeverityDeoptDecorator
  , midSeverityDeoptDecorator
  , lowSeverityDeoptDecorator
  , highSeverityIcDecorator
  , midSeverityIcDecorator
  , lowSeverityIcDecorator
}