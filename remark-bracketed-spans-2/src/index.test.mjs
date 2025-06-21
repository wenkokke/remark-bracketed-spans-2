import path from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkBracketedSpans from "./index.mjs";
import { bracketedSpanToHast } from "mdast-util-bracketed-spans";
import test from "node:test";
import assert from "node:assert/strict";

const rootDir = path.dirname(import.meta.dirname);

const inputFile = path.join(rootDir, "input.md");

const processor = await unified()
  .use(remarkParse)
  .use(remarkBracketedSpans)
  .use(remarkRehype, { handlers: { bracketedSpan: bracketedSpanToHast } })
  .use(rehypeStringify);

/** @type {true} */
const DISABLED = true;

/** @type {[string, string][]} */
const testCases = [
  [
    "[This is *some text*]{#a}",
    '<p><span id="a">This is <em>some text</em></span></p>',
  ],
  [
    "[This is *some text*]{.cls-1}",
    '<p><span class="cls-1">This is <em>some text</em></span></p>',
  ],
  [
    '[This is *some text*]{key="value"}',
    '<p><span key="value">This is <em>some text</em></span></p>',
  ],
  [
    '[This is *some text*]{#a .cls-1 .cls-2 key="value"}',
    '<p><span id="a" class="cls-1 cls-2" key="value">This is <em>some text</em></span></p>',
  ],
  [
    "[This is *some text*]{#a} Hello!",
    '<p><span id="a">This is <em>some text</em></span> Hello!</p>',
  ],
  [
    "[This is *some text*]{#a} *Hello!*",
    '<p><span id="a">This is <em>some text</em></span> <em>Hello!</em></p>',
  ],
  [
    "Hello! [This is *some text*]{#a} Friends?",
    '<p>Hello! <span id="a">This is <em>some text</em></span> Friends?</p>',
  ],
  [
    "[This is some text]{#a}",
    '<p><span id="a">This is some text</span></p>',
  ],
  [
    "[[[This is some text]{#a}]{#b}]{#c}",
    '<p><span id="c"><span id="b"><span id="a">This is some text</span></span></span></p>',
  ],
  [
    "[[This is some text]{#a} in a link](url)",
    '<p><a href="url"><span id="a">This is some text</span> in a link</a></p>',
  ],
  [
    "[This is some text]{#a} [This is a link](url)",
    '<p><span id="a">This is some text</span> <a href="url">This is a link</a></p>',
  ],
  [
    "[[This is a link](url) in some text]{#a}",
    '<p><span id="a"><a href="url">This is a link</a> in some text</span></p>',
  ],
  [
    "[This is some text [with a link](url)]{#a}",
    '<p><span id="a">This is some text <a href="url">with a link</a></span></p>',
  ],
]

testCases.forEach(([inputMarkdown, expectHtml, disabled]) => {
  if (!disabled) {
  test(inputMarkdown, async () => {
    assert.equal(
      (await processor.process(inputMarkdown)).value,
      expectHtml
    );
  });
  }
});
