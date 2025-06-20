/**
 * @import {Options} from "micromark";
 */
import fs from "node:fs";
import path from "node:path";
import { micromark } from "micromark";
import { bracketedSpanHtml } from "./html.mjs";
import { bracketedSpanSyntax } from "./syntax.mjs";

/** @type {Options} */
const options = {
  extensions: [bracketedSpanSyntax()],
  htmlExtensions: [bracketedSpanHtml()],
};

const rootDir = path.dirname(import.meta.dirname);
const inputMd = path.join(rootDir, 'input.md');
const content = fs.readFileSync(inputMd, {encoding: 'utf-8'});
console.log(micromark(content, options));
