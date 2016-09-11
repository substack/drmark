var marked = require('marked')
var browserify = require('browserify')
var Readable = require('readable-stream/readable')

module.exports = function (src, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (!opts) opts = {}
  var streams = {}
  var html = marked(src).replace(
    /(?:^|\n)<script([^>]*)>([\s\S]*?)<\/script[^>]*>/ig,
    function (_, args, code) {
      var r = new Readable
      r.push(code)
      r.push(null)
      var id = Math.floor(Math.random()*Math.pow(16,8)).toString(16)
      streams[id] = r
      return ''
    }
  )
  var files = Object.keys(streams).map(function (id) { return streams[id] })
  var b = browserify(files)
  b.bundle(function (err, buf) {
    if (err) return cb(err)
    cb(null, html + '\n<script>' + buf.toString() + '\n</script>')
  })
}
