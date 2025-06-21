/**
 * @typedef {import("mdast-util-from-markdown").Options} FromMarkdownOptions
 * @typedef {import("mdast-util-to-markdown").Options} ToMarkdownOptions
 * @typedef {import("mdast-util-to-hast").Options} ToHastOptions
 */
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { toHast } from "mdast-util-to-hast";
import { toHtml } from "hast-util-to-html";
import { bracketedSpanSyntax } from "micromark-extension-bracketed-spans";
import {
  bracketedSpanFromMarkdown,
  bracketedSpanToMarkdown,
  bracketedSpanToHast,
} from "./index.mjs";
import test from "node:test";
import assert from "node:assert/strict";

/** @type {FromMarkdownOptions} */
const fromMarkdownOptions = {
  extensions: [bracketedSpanSyntax()],
  mdastExtensions: [bracketedSpanFromMarkdown()],
};

/** @type {ToMarkdownOptions} */
const toMarkdownOptions = {
  extensions: [bracketedSpanToMarkdown()],
};

/** @type {ToHastOptions} */
const toHastOptions = {
  handlers: {
    bracketedSpan: bracketedSpanToHast,
  },
};

/** @type {true} */
const DISABLED = true;

/** @type {[string, string][]} */
const testCases = [
  [
    "[This is *some text*]{#a}",
    null,
    null,
    '<p><span id="a">This is <em>some text</em></span></p>',
  ],
  [
    "[This is *some text*]{.cls-1}",
    null,
    null,
    '<p><span class="cls-1">This is <em>some text</em></span></p>',
  ],
  [
    '[This is *some text*]{key="value"}',
    null,
    null,
    '<p><span key="value">This is <em>some text</em></span></p>',
  ],
  [
    '[This is *some text*]{#a .cls-1 .cls-2 key="value"}',
    null,
    null,
    '<p><span id="a" class="cls-1 cls-2" key="value">This is <em>some text</em></span></p>',
  ],
  [
    "[This is *some text*]{#a} Hello!",
    null,
    null,
    '<p><span id="a">This is <em>some text</em></span> Hello!</p>',
  ],
  [
    "[This is *some text*]{#a} *Hello!*",
    null,
    null,
    '<p><span id="a">This is <em>some text</em></span> <em>Hello!</em></p>',
  ],
  [
    "Hello! [This is *some text*]{#a} Friends?",
    null,
    null,
    '<p>Hello! <span id="a">This is <em>some text</em></span> Friends?</p>',
  ],
  [
    "[This is some text]{#a}",
    null,
    null,
    '<p><span id="a">This is some text</span></p>',
  ],
  [
    "[[[This is some text]{#a}]{#b}]{#c}",
    null,
    null,
    '<p><span id="c"><span id="b"><span id="a">This is some text</span></span></span></p>',
  ],
  [
    "[[This is some text]{#a} in a link](url)",
    null,
    null,
    '<p><a href="url"><span id="a">This is some text</span> in a link</a></p>',
  ],
  [
    "[This is some text]{#a} [This is a link](url)",
    null,
    null,
    '<p><span id="a">This is some text</span> <a href="url">This is a link</a></p>',
  ],
  [
    "[[This is a link](url) in some text]{#a}",
    null,
    null,
    '<p><span id="a"><a href="url">This is a link</a> in some text</span></p>',
  ],
  [
    "[This is some text [with a link](url)]{#a}",
    null,
    null,
    '<p><span id="a">This is some text <a href="url">with a link</a></span></p>',
  ],
];

testCases.forEach(
  ([inputMarkdown, expectMdast, expectHast, expectHtml, disabled]) => {
    if (!disabled) {
      test(inputMarkdown, async () => {
        const mdast = fromMarkdown(inputMarkdown, "utf-8", fromMarkdownOptions);
        if (expectMdast) assert.deepEqual(mdast, expectMdast);
        const markdown = toMarkdown(mdast, toMarkdownOptions).trimEnd();
        assert.equal(markdown, inputMarkdown);
        const hast = toHast(mdast, toHastOptions);
        if (expectHast) assert.deepEqual(hast, expectHast);
        const html = toHtml(hast);
        if (expectHtml) assert.equal(html, expectHtml);
      });
    }
  }
);
