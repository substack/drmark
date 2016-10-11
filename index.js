var marked = require('marked')
var browserify = require('browserify')
var Readable = require('readable-stream/readable')
var falafel = require('falafel')
var highlight = require('highlight-javascript-syntax')
var shasum = require('shasum')

module.exports = function (src, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (!opts) opts = {}
  var streams = {}, keys = []
  var html = marked(src, { sanitize: false }).replace(
    /(?:^|\n)<script([^>]*)>([\s\S]*?)<\/script[^>]*>/ig,
    function (_, args, code) {
      var r = new Readable
      var id = shasum(code)
      r.file = id + '.js'
      r.push('_drmarkCode["'+id+'"]=function(){'+code+'}')
      r.push(null)
      streams[id] = r
      keys.push(id)
      var argopts = parseAttrs(args)
      return '<div id="'+id+'"'
        + (opts.class ? ' class="'+opts.class+'"' : '')+'>'
        + (argopts.show ? '<pre>'
          + (argopts.highlight !== false
            ? highlight(code.trim()) : esc(code.trim()))
          + '</pre>' : '')
        + '</div>'
    }
  )
  var files = keys.map(function (id) { return streams[id] })
  var b = opts.browserify || browserify(opts)
  files.forEach(function (file) { b.add(file) })
  b.bundle(function (err, buf) {
    b._recorded = b._recorded.filter(function (row) {
      return !row.entry
    })
    if (err) return cb(err)
    var target = opts.target || 'document.body'
    if (target === 'body') target = 'document.body'
    if (target !== 'document.body') {
      target = 'document.querySelector('+JSON.stringify(target)+')'
    }
    cb(null, '<script>_drmarkCode={}</script>\n' + html + '\n<script>\n'
      + buf.toString() + '\n;(function(){'
      + 'var target = '+target+'\n'
      + ';'+JSON.stringify(keys)+'.forEach(function(id){'
        + 'var dst = document.getElementById(id)\n'
        + 'var begin = target.childNodes.length\n'
        + 'var dstel = dst.childNodes[dst.childNodes.length-1]\n'
        + '_drmarkCode[id]()\n'
        + 'var end = target.childNodes.length\n'
        + 'for(var i=begin; target.childNodes[i];) {\n'
          + 'var c = target.childNodes[i]\n'
          + 'target.removeChild(c)\n'
          + 'dst.insertBefore(c,dstel)\n'
        + '}\n'
      + '})\n})()</script>')
  })
}

function esc (str) {
  return str.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/&/g, '&amp;')
}

function parseAttrs (str) {
  var obj = {}
  str.replace(/([^=\s]+)(?:\s*=\s*(?:"([^"]*?)"|\'([^']*?)\'|(\S*)))?/g, fn)
  return obj
  function fn (_, key, doublev, singlev, barev) {
    obj[key] = doublev || singlev || barev || true
    if (/^(false|no|off)$/i.test(obj[key])) obj[key] = false
  }
}
