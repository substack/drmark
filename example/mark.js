var drmark = require('../')
var fs = require('fs')

var src = fs.readFileSync(process.argv[2], 'utf8')
drmark(src, { transform: ['multi-regl-transform'] }, function (err, html) {
  if (err) console.error(err)
  else console.log(html)
})
