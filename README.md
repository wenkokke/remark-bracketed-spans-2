# `remark-bracketed-spans-2`

A plugin for [`remark`](https://github.com/remarkjs/remark) to support [Pandoc-style](https://pandoc.org/MANUAL.html#extension-bracketed_spans) bracketed spans.

## Why `2`?

There is an old [`remark-bracketed-spans`](https://www.npmjs.com/package/remark-bracketed-spans) plugin that no longer works.

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

## Repository

This repository contains three packages that provide support for Pandoc-style bracketed spans in remark.

-   [`micromark-extension-bracketed-spans`](https://github.com/wenkokke/remark-bracketed-spans-2/tree/main/micromark-extension-bracketed-spans)
    Defines a syntax extension for micromark, which tokenizes the markdown.
-   [`mdast-util-bracketed-spans`](https://github.com/wenkokke/remark-bracketed-spans-2/tree/main/mdast-util-bracketed-spans)
    Defines the parser that converts the token stream produced by micromark to a `mdast` markdown abstract syntax tree, as well as a pretty-printer that converts the abstract syntax tree back to markdown, and a transformation that converts the abstract syntax tree to a `hast` html abstract syntax tree.
-   [`remark-bracketed-spans-2`](https://github.com/wenkokke/remark-bracketed-spans-2/tree/main/remark-bracketed-spans-2)
    Wraps the functionality provided by the above packages in a `remark` plugin.

For more information, see the individual folders for each package.

## Contributing

Pull requests for bug fixes are welcome.

## Acknowledgements

Thanks to [@benrbray](https://github.com/benrbray) whose [remark-cite](https://github.com/benrbray/remark-cite) plugin was a remarkable guide when writing this plugin.
