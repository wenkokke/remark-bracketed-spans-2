/**
 * @typedef {import("micromark-util-types").CompileContext} CompileContext
 * @typedef {import("micromark-util-types").HtmlExtension} HtmlExtension
 * @typedef {import("micromark-util-types").Handle} Handle
 */
import assert from "node:assert";
import { parseEntities } from "parse-entities";

const types = {
  bracketedSpanStack: "bracketedSpanStack",
  bracketedSpanAttributes: "bracketedSpanAttributes",
};

/**
 * @returns {HtmlExtension}
 */
export function bracketedSpanHtml() {
  return {
    enter: {
      bracketedSpan: enterBracketedSpan,
      bracketedSpanAttributes: enterBracketedSpanAttributes,
    },
    exit: {
      bracketedSpan: exitBracketedSpan,
      bracketedSpanAttributes: exitBracketedSpanAttributes,
      bracketedSpanAttributeIdValue: exitBracketedSpanAttributeIdValue,
      bracketedSpanAttributeClassValue: exitBracketedSpanAttributeClassValue,
      bracketedSpanAttributeName: exitBracketedSpanAttributeName,
      bracketedSpanAttributeValue: exitBracketedSpanAttributeValue,
    },
  };
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function enterBracketedSpan() {
  let stack = this.getData(types.bracketedSpanStack);
  if (!stack) this.setData(types.bracketedSpanStack, (stack = []));
  stack.push({});
  enterBracketedSpanContent.call(this);
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function exitBracketedSpan() {
  const stack = this.getData(types.bracketedSpanStack);
  assert(stack, `expected ${types.bracketedSpanStack}`);
  const bracketedSpan = stack.pop();
  assert(bracketedSpan, "expected bracketedSpan");
  const { attributes, content } = bracketedSpan;
  this.tag(`<span${attributes ? " " + attributes : ""}>`);
  this.raw(content);
  this.tag(`</span>`);
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function enterBracketedSpanContent() {
  this.buffer();
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function exitBracketedSpanContent() {
  const data = this.resume();
  const stack = this.getData(types.bracketedSpanStack);
  assert(stack, `expected ${types.bracketedSpanStack}`);
  stack[stack.length - 1].content = data;
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function enterBracketedSpanAttributes() {
  exitBracketedSpanContent.call(this);
  this.buffer();
  this.setData(types.bracketedSpanAttributes, []);
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function exitBracketedSpanAttributes() {
  const stack = this.getData(types.bracketedSpanStack);
  assert(stack, `expected ${types.bracketedSpanStack}`);
  const attributes = this.getData(types.bracketedSpanAttributes);
  assert(attributes, `expected ${types.bracketedSpanAttributes}`);
  // Clean up attributes
  const id = attributes.find(([key, _value]) => key === "id")[1];
  const classNames = attributes.flatMap(([key, value]) =>
    key === "class" ? [value] : []
  );
  const cleaned = {};
  if (id) {
    cleaned.id = id;
  }
  if (Array.isArray(classNames) && classNames.length >= 1) {
    cleaned.class = classNames.join(" ");
  }
  for (const [key, value] of attributes) {
    if (!["id", "class"].includes(key)) {
      cleaned[key] = value;
    }
  }
  // Render attributes
  const rendered = Object.entries(cleaned)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
  this.resume();
  this.setData(types.bracketedSpanAttributes);
  stack[stack.length - 1].attributes = rendered;
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function exitBracketedSpanAttributeIdValue(token) {
  const attributes = this.getData(types.bracketedSpanAttributes);
  assert(attributes, `expected ${types.bracketedSpanAttributes}`);
  const idValue = parseEntities(this.sliceSerialize(token), {
    attribute: true,
  });
  attributes.push(["id", idValue]);
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function exitBracketedSpanAttributeClassValue(token) {
  const attributes = this.getData(types.bracketedSpanAttributes);
  assert(attributes, `expected ${types.bracketedSpanAttributes}`);
  const classValue = parseEntities(this.sliceSerialize(token), {
    attribute: true,
  });
  attributes.push(["class", classValue]);
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function exitBracketedSpanAttributeName(token) {
  const attributes = this.getData(types.bracketedSpanAttributes);
  assert(attributes, `expected ${types.bracketedSpanAttributes}`);
  const name = this.sliceSerialize(token);
  attributes.push([name, ""]);
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function exitBracketedSpanAttributeValue(token) {
  const attributes = this.getData(types.bracketedSpanAttributes);
  assert(attributes, `expected ${types.bracketedSpanAttributes}`);
  const value = parseEntities(this.sliceSerialize(token), { attribute: true });
  attributes[attributes.length - 1][1] = value;
}
