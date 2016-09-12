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
      var id = Math.floor(Math.random()*Math.pow(16,8)).toString(16)
      r.push('_drmark' + id + '=function(){'+code+'}')
      r.push(null)
      streams[id] = r
      return '<script>_drmark'+id+'()</script>'
    }
  )
  var files = Object.keys(streams).map(function (id) { return streams[id] })
  var b = browserify(files, opts)
  b.bundle(function (err, buf) {
    if (err) return cb(err)
    cb(null, '\n<script>' + buf.toString() + '\n</script>' + html)
  })
}
