/**
 * @typedef {import("mdast-util-from-markdown").CompileContext} CompileContext
 * @typedef {import("mdast-util-from-markdown").Extension} Extension
 * @typedef {import("mdast-util-from-markdown").Handle} Handle
 * @typedef {import("mdast-util-from-markdown").OnEnterErro} OnEnterErro
 */
import assert from "node:assert";
import { parseEntities } from "parse-entities";
import { html, normalize } from "property-information";

/** @returns {Extension} */
export function bracketedSpanFromMarkdown() {
  return {
    enter: {
      bracketedSpan: enterBracketedSpan,
    },
    exit: {
      bracketedSpan: exitBracketedSpan,
      bracketedSpanAttributes: onExitData,
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
function enterBracketedSpan(token) {
  assert(this.stack, "expected `this.stack`");
  // Create the node.
  const node = {
    type: "bracketedSpan",
    children: [],
    properties: {},
    position: {
      start: point(token.start),
      end: undefined,
    },
  };
  // Insert the node into the syntax tree.
  const parent = this.stack[this.stack.length - 1];
  assert(parent, "expected `parent`");
  assert("children" in parent, "expected `parent`");
  /** @type {Array<Nodes>} */
  const siblings = parent.children;
  siblings.push(node);
  this.stack.push(node);
  // Push the token onto the token stack.
  this.tokenStack.push([token, undefined]);
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function exitBracketedSpan(token, onExitError) {
  assert(this.stack, "expected `this.stack`");
  const node = this.stack.pop();
  assert(node, "expected `node");
  const open = this.tokenStack.pop();
  if (!open) {
    throw new Error(
      "Cannot close `" +
        token.type +
        "` (" +
        stringifyPosition({ start: token.start, end: token.end }) +
        "): it’s not open"
    );
  }
  if (open[0].type !== token.type) {
    if (onExitError) {
      onExitError.call(this, token, open[0]);
    } else {
      const handler = open[1] || defaultOnError;
      handler.call(this, token, open[0]);
    }
  }
  assert(node.type !== "fragment", "unexpected fragment `exit`ed");
  assert(node.position, "expected `position` to be defined");
  node.position.end = point(token.end);
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function exitBracketedSpanAttributeIdValue(token) {
  assert(this.stack, "expected `this.stack`");
  const node = this.stack[this.stack.length - 1];
  assert(node.type === "bracketedSpan", "expected `bracketedSpan`");
  const idName = html.normal[normalize("id")];
  const idValue = parseEntities(this.sliceSerialize(token), {
    attribute: true,
  });
  assert(node?.properties !== undefined, "expected `properties`");
  node.properties[idName] = idValue;
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function exitBracketedSpanAttributeClassValue(token) {
  assert(this.stack, "expected `this.stack`");
  const node = this.stack[this.stack.length - 1];
  assert(node.type === "bracketedSpan", "expected `bracketedSpan`");
  const className = html.normal[normalize("class")];
  const classValue = parseEntities(this.sliceSerialize(token), {
    attribute: true,
  });
  assert(node?.properties !== undefined, "expected `properties`");
  if (node.properties[className] === undefined) {
    node.properties[className] = [];
  }
  node.properties[className].push(classValue);
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function exitBracketedSpanAttributeName(token) {
  assert(this.stack, "expected `this.stack`");
  const node = this.stack[this.stack.length - 1];
  assert(node.type === "bracketedSpan", "expected `bracketedSpan`");
  const attrName = parseEntities(this.sliceSerialize(token), {
    attribute: true,
  });
  const propName = html.normal[normalize(attrName)] ?? attrName;
  assert(node?.properties !== undefined, "expected `properties`");
  node.properties[propName] = true;
  node._propName = propName;
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function exitBracketedSpanAttributeValue(token) {
  assert(this.stack, "expected `this.stack`");
  const node = this.stack[this.stack.length - 1];
  // let index = this.stack.length;
  // let node;
  // while (index--) {
  //   node = this.stack[index];
  //   if (node.type === "bracketedSpan") {
  //     break;
  //   }
  // }
  assert(node.type === "bracketedSpan", "expected `bracketedSpan`");
  assert(node._propName, "expected `_propName`");
  const attrValue = parseEntities(this.sliceSerialize(token), {
    attribute: true,
  });
  assert(node?.properties !== undefined, "expected `properties`");
  assert(
    node.properties[node._propName] === true,
    "expected `propName` === true"
  );
  node.properties[node._propName] = attrValue;
  delete node._propName;
}

/**
 * Copy a point-like value.
 *
 * @param {Point} d
 *   Point-like value.
 * @returns {Point}
 *   unist point.
 */
function point(d) {
  return { line: d.line, column: d.column, offset: d.offset };
}

/** @type {OnEnterError} */
function defaultOnError(left, right) {
  if (left) {
    throw new Error(
      "Cannot close `" +
        left.type +
        "` (" +
        stringifyPosition({ start: left.start, end: left.end }) +
        "): a different token (`" +
        right.type +
        "`, " +
        stringifyPosition({ start: right.start, end: right.end }) +
        ") is open"
    );
  } else {
    throw new Error(
      "Cannot close document, a token (`" +
        right.type +
        "`, " +
        stringifyPosition({ start: right.start, end: right.end }) +
        ") is still open"
    );
  }
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function onExitData(token) {
  const node = this.stack[this.stack.length - 1];
  assert(node, "expected a `node` to be on the stack");
  if (node.type === "text") {
    this.stack.pop();
    assert(node.position, "expected `node` to have an open position");
    node.value += this.sliceSerialize(token);
    node.position.end = point(token.end);
  }
}
