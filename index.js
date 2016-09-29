var marked = require('marked')
var browserify = require('browserify')
var Readable = require('readable-stream/readable')
var falafel = require('falafel')
var highlight = require('highlight-javascript-syntax')

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
      var id = Math.floor(Math.random()*Math.pow(16,8)).toString(16)
      r.push('_drmarkCode["'+id+'"]=function(){'+code+'}')
      r.push(null)
      streams[id] = r
      keys.push(id)
      var argopts = parseAttrs(args)
      if (opts.deferred) {
        return '<div id="'+id+'"></div>'
          + (argopts.show ? '<pre>'
            + (argopts.highlight !== false ? highlight(code) : esc(code))
            + '</pre>' : '')
      } else {
        return '<script>_drmarkCode["'+id+'"]()</script>'
          + (argopts.show ? '<pre>'
            + (argopts.highlight !== false ? highlight(code) : esc(code))
            + '</pre>' : '')
      }
    }
  )
  var files = keys.map(function (id) { return streams[id] })
  var b = opts.browserify || browserify(opts)
  files.forEach(function (file) { b.add(file) })
  b.bundle(function (err, buf) {
    if (err) cb(err)
    else if (opts.deferred) {
      var target = opts.target || 'document.body'
      if (target === 'body') target = 'document.body'
      if (target !== 'document.body') {
        target = 'document.querySelector('+JSON.stringify(target)+')'
      }
      cb(null, '<script>_drmarkCode={}</script>\n' + html + '\n<script>\n'
        + buf.toString() + '\n;(function(){'
        + 'var target = '+target+'\n'
        + ';'+JSON.stringify(Object.keys(streams))+'.forEach(function(id){'
          + 'var dst = document.getElementById(id)\n'
          + 'var begin = target.childNodes.length\n'
          + '_drmarkCode[id]()\n'
          + 'var end = target.childNodes.length\n'
          + 'for(var i=begin; target.childNodes[i];) {\n'
            + 'var c = target.childNodes[i]\n'
            + 'target.removeChild(c)\n'
            + 'dst.appendChild(c)\n'
          + '}\n'
        + '})\n})()</script>')
    } else {
      cb(null, '\n<script>_drmarkCode={};\n'
        + buf.toString() + '\n</script>' + html)
    }
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
