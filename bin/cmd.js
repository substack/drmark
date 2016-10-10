#!/usr/bin/env node
var drmark = require('../')
var fs = require('fs')
var path = require('path')
var concat = require('concat-stream')
var sprintf = require('sprintf')
var minimist = require('minimist')
var fromArgs = require('browserify/bin/args.js')
var watchify = require('watchify')
var wsock = require('websocket-stream')
var onend = require('end-of-stream')
var outpipe = require('outpipe')
var ecstatic = require('ecstatic')

var wsockfile = require.resolve('websocket-stream/stream')
var splitfile = require.resolve('split2')
var tofile = require.resolve('to2')
var onendfile = require.resolve('end-of-stream')
var http = require('http')

var argv = minimist(process.argv.slice(2), {
  alias: { w: 'watch', i: 'infile', o: 'outfile', v: 'verbose' },
  default: { infile: '-', outfile: '-', dir: process.cwd() },
  boolean: ['deferred','watch','verbose','live','server']
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
  var opts = argv
  var b = fromArgs(process.argv.slice(2), { cache: {}, packageCache: {} })
  opts.browserify = b
  if (argv.watch) {
    b.plugin(watchify)
    if (argv.infile !== '-') b.emit('file', argv.infile)
  }
  b.on('update', build)
  var wsaddr = null, streams = [], postsrc = '', queue = []
  var bundle = null
  if (opts.live || opts.server) {
    var st = ecstatic(argv.dir)
    var server = http.createServer(function (req, res) {
      if (req.url.split('?')[0] === '/') {
        res.setHeader('cache-control', 'max-age=0,must-revalidate')
        if (bundle) res.end(bundle)
        else queue.push(res.end.bind(res))
      } else st(req, res)
    })
    server.listen(9955, function () {
      console.log('http://localhost:' + server.address().port)
      wsaddr = 'ws://localhost:' + server.address().port
      postsrc = !opts.live ? '' : `\n<script>(function recon () {
        var stream = require(${str(wsockfile)})(${str(wsaddr)})
        require(${str(onendfile)})(stream, function () {
          setTimeout(recon, 500)
        })
        stream.pipe(require(${str(splitfile)})())
          .pipe(require(${str(tofile)})(write))
        function write (buf, enc, next) {
          try { var row = JSON.parse(buf.toString('utf8')) }
          catch (e) { return next() }
          if (row.cmd === 'reload') {
            console.log('reload')
            location.href = location.protocol + '//' + location.host
              + location.pathname + '?' + Date.now()
          }
          next()
        }
      })()</script>`
      build()
    })
    wsock.createServer({ server: server }, function (stream) {
      streams.push(stream)
      onend(stream, function () {
        var i = streams.indexOf(stream)
        streams.splice(i,1)
      })
    })
  } else build()

  function build () {
    var instream = argv.infile === '-'
      ? process.stdin
      : fs.createReadStream(argv.infile)
    var outstream = argv.outfile === '-'
      ? process.stdout
      : outpipe(argv.outfile)
    outstream.once('finish', function () {
      if (opts.live) {
        streams.forEach(function (s) {
          s.write('{"cmd":"reload"}\n')
        })
      }
    })
    instream.pipe(concat(function (src) {
      if (argv.infile !== '-') b.emit('file', argv.infile)
      var start = Date.now()
      drmark(src + postsrc, opts, function (err, html) {
        if (err) {
          console.error(err)
          if (!opts.watch) process.exit(1)
        } else {
          if (argv.outfile === '-') {
            outstream.write(html)
          } else outstream.end(html)
          bundle = html
          queue.splice(0).forEach(function (q) { q(html) })
        }
        if (argv.verbose) {
          var elapsed = (Date.now() - start) / 1000
          console.error(sprintf('built in %.2f seconds', elapsed))
        }
      })
    }))
  }
}

function str (x) { return JSON.stringify(x) }
