# `mdast-util-bracketed-spans`

A collection of extensions that provide support for [`pandoc`-style](https://pandoc.org/MANUAL.html#extension-bracketed_spans) bracketed spans.
This package provides:

- `bracketedSpanFromMarkdown`
  An extension for [`mdast-util-from-markdown`](https://github.com/syntax-tree/mdast-util-from-markdown)
- `bracketedSpanToMarkdown`
  An extension for [`mdast-util-to-markdown`](https://github.com/syntax-tree/mdast-util-to-markdown)
- `bracketedSpanToMarkdown`
  An extension for [`mdast-util-to-hast`](https://github.com/syntax-tree/mdast-util-to-hast)

Using [`remark`](https://github.com/remarkjs/remark)? You probably shouldn't use this package directly, but instead use [`remark-bracketed-spans-2`](https://github.com/wenkokke/remark-bracketed-spans-2/tree/main/remark-bracketed-spans-2).

## Usage

```javascript
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { toHast } from "mdast-util-to-hast";
import { toHtml } from "hast-util-to-html";
import { bracketedSpanSyntax } from "micromark-extension-bracketed-spans";
import { bracketedSpanFromMarkdown } from "mdast-util-bracketed-spans";
import { bracketedSpanToMarkdown } from "mdast-util-bracketed-spans";
import { bracketedSpanToHast } from "mdast-util-bracketed-spans";

const input = '[This is some text]{#id .cls key="value"}';

const mdast = fromMarkdown(input, "utf-8", {
  extensions: [bracketedSpanSyntax()],
  mdastExtensions: [bracketedSpanFromMarkdown()],
});

const markdown = toMarkdown(mdast, {
  extensions: [bracketedSpanToMarkdown()],
});
console.log(markdown);
// '[This is some text]{#id .cls key="value"}'

const hast = toHtml(mdast, {
  handlers: {
    bracketedSpan: bracketedSpanToHast,
  },
});

const html = toHtml(hast);
console.log(html);
// <p><span id="a">This is <em>some text</em></span></p>
```
