/**
 * @typedef {import("mdast-util-to-hast").State} State
 * @typedef {import("mdast-util-types").Node} MdastNode
 * @typedef {import("@types/hast").Node} HastNode
 */
import assert from "node:assert";

/**
 * @param {State} state
 * @param {MdastNode} node
 * @param {MdastNode | undefined} parent
 * @returns {Array<HastNode> | HastNode | undefined}
 */
export function bracketedSpanToHast(state, node, _parent) {
  assert(node.type === "bracketedSpan");
  const result = {
    type: "element",
    tagName: "span",
    properties: node.properties,
    children: state.all(node),
  };
  state.patch(node, result);
  return state.applyData(node, result);
}
