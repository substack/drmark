# drmark

turn markdown with embedded browserifiable demos into html

Your code should append elements to `document.body` or a custom target and they
will appear inline in the page.

# regl example

[view the html for this demo](http://substack.neocities.org/drmark_demo.html)

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
<style>
.identifier {
  font-weight: bold;
}
.template-element {
  background-color: cyan;
  color: purple;
}
.literal {
  color: red;
}
</style>

# hello

whatever

<script show>
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

<script show highlight=false>
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

# usage

```
drmark {OPTIONS} < infile.md > outfile.html

Read markdown from stdin and write html to stdout.

OPTIONS are the same as browserify plus:

   --deferred  Place the script tag after content.
   --target    Append elements to this spot in the page as a query selector.
-w --watch     Recompile when an input file changes.
   --live      Reload automatically when an input file changes.
   --server    Start a server without live reload.
-v --verbose   Print a message every time the code is recompiled.
-i --infile    Read from a file. Default: - (stdin)
-o --outfile   Write to a file. Default: - (stdout)

You can specify commands with `-o`:

  drmark -i infile.md -o 'gzip > index.html.gz'
```

To recompile changes automatically when you edit a file, you can use the
onchange command (`npm install -g onchange`):

```
$ onchange mark.md -- sh -c 'drmark < mark.md > mark.html'
```

# syntax

To insert an inline script tag, include a `<script>` tag at the beginning of a
line in the markdown file. You can set these html attributes on the script tag:

* `show` - whether to show code. default: `false`
* `highlight` - whether to wrap shown code in spans. default: `true`

For example:

``` html
# hello this is markdown whatever

<script show highlight=false>
  // ...
</script>
```

The syntax highlighting wraps javascript tokens in span tags with acorn/esprima
node types for class names converted from camel case to lower-case and dashed.

# api

``` js
var drmark = require('drmark')
```

## drmark(src, opts, cb)

Convert a markdown document source string `src` to html by `cb(err, html)`.

Any `opts` provided are passed through to browserify plus:

* `opts.deferred` - place the script tag after content. default: `false`
* `opts.target` - append elements to this query selector. default: `'body'`

# install

To get the library:

```
$ npm install drmark
```

To get the command:

```
$ npm install -g drmark
```

# license

BSD
