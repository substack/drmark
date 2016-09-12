# hello

whatever

<script visible>
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

<script visible>
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
