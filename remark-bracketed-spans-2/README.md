# `remark-bracketed-spans-2`

A plugin for [`remark`](https://github.com/remarkjs/remark) to support [Pandoc-style](https://pandoc.org/MANUAL.html#extension-bracketed_spans) bracketed spans.

## Why `2`?

Because there is an old [`remark-bracketed-spans`](https://www.npmjs.com/package/remark-bracketed-spans) plugin that no longer works.

## Usage

```javascript
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkBracketedSpans2 from "remark-bracketed-spans-2";
import { bracketedSpanToHast } from "mdast-util-bracketed-spans";

const processor = await unified()
  .use(remarkParse)
  .use(remarkBracketedSpans2)
  .use(remarkRehype, { handlers: { bracketedSpan: bracketedSpanToHast } })
  .use(rehypeStringify);

const input = '[This is some text]{#id .cls key="value"}';

console.log((await processor.process(input)).value);
// <p><span id="a">This is <em>some text</em></span></p>
```
