#!/usr/bin/env node
var drmark = require('../')
var fs = require('fs')
var concat = require('concat-stream')
var fromArgs = require('browserify/bin/args.js')

process.stdin.pipe(concat(function (src) {
  var b = fromArgs(process.argv.slice(2))
  drmark(src.toString('utf8'), { browserify: b }, function (err, html) {
    if (err) {
      console.error(err)
      process.exit(1)
    } else console.log(html)
  })
}))
