# drmark

turn markdown with embedded browserifiable demos into html

# regl example

``` js
var drmark = require('drmark')
var fs = require('fs')

var src = fs.readFileSync(process.argv[2], 'utf8')
drmark(src, { transform: ['multi-regl-transform'] }, function (err, html) {
  if (err) console.error(err)
  else console.log(html)
})
```

``` md
# hello

whatever

<script>
var regl = require('regl')()
var mat4 = require('gl-mat4')
var rmat = []
var draw = regl({
  frag: `
    precision mediump float;
    varying vec2 uv;
    void main () {
      float x = uv.x + 2.0, y = uv.y + 3.0;
      gl_FragColor = vec4(
        sin(x*x*8.0 + x*y*5.0 + x*y*x*y*0.04),
        sin(x*x*3.0 + x*y*6.0 + x*y*x*y*0.08),
        sin(x*x*11.0 + x*y*7.0 + x*y*x*y*0.02),
        1
      );
    }
  `,
  vert: `
    precision mediump float;
    attribute vec2 position;
    varying vec2 uv;
    void main () {
      uv = position;
      gl_Position = vec4(position,0,1);
    }
  `,
  attributes: {
    position: [-5,5,-5,-5,5,0]
  },
  elements: [0,1,2]
})
regl.frame(() => {
  regl.clear({ color: [0,0,0,1], depth: true })
  draw()
})
</script>

# hey now

<script>
var regl = require('regl')()
var mat4 = require('gl-mat4')
var rmat = []
var draw = regl({
  frag: `
    precision mediump float;
    varying vec2 uv;
    void main () {
      float x = uv.x + 2.0, y = uv.y + 3.0;
      gl_FragColor = vec4(uv,1,1);
    }
  `,
  vert: `
    precision mediump float;
    attribute vec2 position;
    varying vec2 uv;
    void main () {
      uv = position;
      gl_Position = vec4(position,0,1);
    }
  `,
  attributes: {
    position: [-5,5,-5,-5,5,0]
  },
  elements: [0,1,2]
})
regl.frame(() => {
  regl.clear({ color: [0,0,0,1], depth: true })
  draw()
})
</script>

ok...
```

# api

``` js
var drmark = require('drmark')
```

## drmark(src, opts, cb)

Convert a markdown document source string `src` to html by `cb(err, html)`.

Any `opts` provided are passed through to browserify.

# license

BSD
