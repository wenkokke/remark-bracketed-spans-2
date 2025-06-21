# `micromark-extension-bracketed-spans`

A syntax extension for the **[`micromark`](https://github.com/micromark/micromark)** markdown parser that provides [`pandoc`-style](https://pandoc.org/MANUAL.html#extension-bracketed_spans) bracketed spans.

You probably shouldn't use this package directly, but instead use [`mdast-util-bracketed-spans`](https://github.com/wenkokke/remark-bracketed-spans-2/tree/main/mdast-util-bracketed-spans) with [mdast](https://github.com/syntax-tree/mdast) or [`remark-bracketed-spans-2`](https://github.com/wenkokke/remark-bracketed-spans-2/tree/main/remark-bracketed-spans-2) with [remark](https://github.com/remarkjs/remark).

## Usage

```javascript
import { micromark } from "micromark";
import { bracketedSpanHtml } from "micromark-extension-bracketed-spans";
import { bracketedSpanSyntax } from "micromark-extension-bracketed-spans";

let serialized = micromark('[This is some text]{#id .cls key="value"}', {
    extensions: [bracketedSpanSyntax()],
    htmlExtensions: [bracketedSpanHtml()]
});
```

The serialized result will be the following.  To get an abstract syntax tree, use `mdast-util-bracketed-spans` instead.

```html
<p><span id="id" class="cls" key="value">This is some text</span></p>
```

## Differences from Pandoc

The parser used for the attributes is the same as used by [`micromark-extension-directive`](https://github.com/micromark/micromark-extension-directive). This leads to a few edge-cases where this plugin behaves differently from Pandoc.
For instance, the following does *not* parse using `micromark-extension-bracketed-spans`:

```md
[This is some text]{key="value}
```

Pandoc happily parses this and renders it to

```html
<p><span key="&quot;value">This is some text</span></p>
```

I believe these small incompatibilities with Pandoc are worth the compatibility with the popular `micromark-extension-directive` plugin.
