/**
 * @typedef {import("mdast-util-to-markdown").Exit} Exit
 * @typedef {import("mdast-util-to-markdown").Extension} Extension
 * @typedef {import("mdast-util-to-markdown").Handle} Handle
 * @typedef {import("mdast-util-to-markdown").Options} Options
 */
import { find, html, normalize } from "property-information";
import { stringifyEntities } from "stringify-entities";

/**
 * @param { Options | null | undefined } options
 * @returns { Extension }
 */
export function bracketedSpanToMarkdown(_options) {
  return {
    handlers: {
      bracketedSpan,
    },
  };

  /** @type { Handle } */
  function bracketedSpan(node, _, state, _info) {
    const tracker = state.createTracker();
    /** @type {Exit} */
    let exit;
    /** @type {Exit} */
    let subexit;
    exit = state.enter("bracketedSpan");
    subexit = state.enter("bracketedSpanContent");
    let value = tracker.move("[");
    value += tracker.move(
      state.containerPhrasing(node, {
        before: value,
        after: "]{",
        ...tracker.current(),
      })
    );
    value += tracker.move("]");
    subexit(); // bracketedSpanContent
    value += tracker.move("{");
    subexit = state.enter("bracketedSpanAttributes");
    if (node?.properties) {
      for (const [propIndex, [propName, propValue]] of Object.entries(
        node.properties
      ).entries()) {
        // Handle spacing. Painfully.
        if (propIndex !== 0) {
          value += tracker.move(" ");
        }
        // Handle identifiers.
        if (propName === html.normal[normalize("id")]) {
          const attrIdExit = state.enter("bracketedSpanAttributeId");
          value += tracker.move("#");
          value += tracker.move(stringifyAttrValue(propValue));
          attrIdExit();
        }
        // Handle classes.
        else if (propName === html.normal[normalize("class")]) {
          const classNames = Array.isArray(propValue) ? propValue : [propValue];
          for (const [classIndex, className] of classNames.entries()) {
            if (classIndex !== 0) {
              value += tracker.move(" ");
            }
            const attrClassExit = state.enter("bracketedSpanAttributeClass");
            value += tracker.move(".");
            value += tracker.move(stringifyAttrValue(className));
            attrClassExit();
          }
        }
        // Handle general attributes.
        else {
          const attrNameExit = state.enter("bracketedSpanAttributeName");
          const propInfo = find(html, propName);
          const attrName = stringifyEntities(propInfo?.attribute ?? propName);
          value += tracker.move(attrName);
          attrNameExit(); // bracketedSpanAttributeName
          if (propValue && propValue !== true) {
            value += tracker.move("=");
            const attrValueExit = state.enter("bracketedSpanAttributeValue");
            value += tracker.move('"');
            value += tracker.move(stringifyAttrValue(propValue));
            value += tracker.move('"');
            attrValueExit(); // bracketedSpanAttributeValue
          }
        }
      }
    }
    subexit(); // bracketedSpanAttributes
    value += tracker.move("}");
    exit(); // bracketedSpan
    return value;
  }

  /**
   * @param {string | string[] | true} value
   */
  function stringifyAttrValue(value) {
    if (Array.isArray(value)) {
      value = value.join(" ");
    }
    if (value === true) {
      value = "true";
    }
    return stringifyEntities(value);
  }
}
