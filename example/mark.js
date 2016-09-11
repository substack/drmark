var drmark = require('../')
var fs = require('fs')

var src = fs.readFileSync(process.argv[2], 'utf8')
drmark(src, function (err, html) {
  if (err) console.error(err)
  else console.log(html)
})
