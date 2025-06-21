/**
 * @import { Plugin } from "unified"
 */

import { bracketedSpanSyntax } from "micromark-extension-bracketed-spans";
import { bracketedSpanFromMarkdown } from "mdast-util-bracketed-spans";
import { bracketedSpanToMarkdown } from "mdast-util-bracketed-spans";

/**
 * @type {Plugin}
 */
export function remarkBracketedSpans() {
  var data = this.data();
  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const toMarkdownExtensions =
    data.toMarkdownExtensions || (data.toMarkdownExtensions = []);
  micromarkExtensions.push(bracketedSpanSyntax());
  fromMarkdownExtensions.push(bracketedSpanFromMarkdown());
  toMarkdownExtensions.push(bracketedSpanToMarkdown());
}

export default remarkBracketedSpans;
