#!/usr/bin/env node
var drmark = require('../')
var fs = require('fs')
var path = require('path')
var concat = require('concat-stream')
var sprintf = require('sprintf')
var minimist = require('minimist')
var fromArgs = require('browserify/bin/args.js')
var watchify = require('watchify')

var argv = minimist(process.argv.slice(2), {
  alias: { w: 'watch', i: 'infile', o: 'outfile', v: 'verbose' },
  default: { infile: '-', outfile: '-' },
  boolean: ['deferred','watch','verbose']
})
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
  var b = fromArgs(process.argv.slice(2), { cache: {}, packageCache: {} })
  var opts = argv
  opts.browserify = b
  if (argv.watch) {
    b.plugin(watchify)
    if (argv.infile !== '-') b.emit('file', argv.infile)
  }
  b.on('update', build)
  build()

  function build () {
    var instream = argv.infile === '-'
      ? process.stdin
      : fs.createReadStream(argv.infile)
    var outstream = argv.outfile === '-'
      ? process.stdout
      : fs.createWriteStream(argv.outfile)
    instream.pipe(concat(function (src) {
      var start = Date.now()
      drmark(src.toString('utf8'), opts, function (err, html) {
        if (err) {
          console.error(err)
          if (!opts.watch) process.exit(1)
        } else {
          outstream.end(html)
        }
        if (argv.verbose) {
          var elapsed = (Date.now() - start) / 1000
          console.error(sprintf('built in %.2f seconds', elapsed))
        }
      })
    }))
  }
}
