#!/usr/bin/env node
var drmark = require('../')
var fs = require('fs')
var path = require('path')
var concat = require('concat-stream')
var minimist = require('minimist')
var fromArgs = require('browserify/bin/args.js')

var argv = minimist(process.argv.slice(2))
if (argv.help || argv.h) {
  fs.readFile(path.join(__dirname,'usage.txt'),'utf8',function (err, src) {
    if (err) {
      console.error(err)
      process.exit(1)
    } else {
      console.log(src)
    }
  })
} else {
  process.stdin.pipe(concat(function (src) {
    var b = fromArgs(process.argv.slice(2))
    drmark(src.toString('utf8'), { browserify: b }, function (err, html) {
      if (err) {
        console.error(err)
        process.exit(1)
      } else console.log(html)
    })
  }))
}
