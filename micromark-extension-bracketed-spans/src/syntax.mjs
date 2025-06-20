/**
 * @typedef {import("micromark-util-types").Construct} Construct
 * @typedef {import("micromark-util-types").Extension} Extension
 * @typedef {import("micromark-util-types").State} State
 * @typedef {import("micromark-util-types").Tokenizer} Tokenizer
 * @typedef {import("micromark-util-types").TokenizeContext} TokenizeContext
 */
import assert from "node:assert";
import { codes, types as builtinTypes } from "micromark-util-symbol";
import { push, splice } from "micromark-util-chunked";
import { resolveAll } from "micromark-util-resolve-all";
import { factoryAttributes } from "./factory-attributes.mjs";

export const types = {
  bracketedSpan: "bracketedSpan",
  bracketedSpanContent: "bracketedSpanContent",
  bracketedSpanContentText: "bracketedSpanContentText",
  bracketedSpanContentStart: "bracketedSpanContentStart",
  bracketedSpanContentEnd: "bracketedSpanContentEnd",
  bracketedSpanContentMarker: "bracketedSpanContentMarker",
  bracketedSpanAttributes: "bracketedSpanAttributes",
  bracketedSpanAttributesMarker: "bracketedSpanAttributesMarker",
  bracketedSpanAttribute: "bracketedSpanAttribute",
  bracketedSpanAttributeId: "bracketedSpanAttributeId",
  bracketedSpanAttributeClass: "bracketedSpanAttributeClass",
  bracketedSpanAttributeName: "bracketedSpanAttributeName",
  bracketedSpanAttributeInitializer: "bracketedSpanAttributeInitializer",
  bracketedSpanAttributeValueLiteral: "bracketedSpanAttributeValueLiteral",
  bracketedSpanAttributeValue: "bracketedSpanAttributeValue",
  bracketedSpanAttributeValueData: "bracketedSpanAttributeValueData",
  bracketedSpanAttributeValueMarker: "bracketedSpanAttributeValueMarker",
};

/** @returns {Extension} */
export function bracketedSpanSyntax() {
  return {
    text: { [codes.rightSquareBracket]: bracketedSpanEnd() },
  };
}

/** @type {Construct} */
function bracketedSpanEnd() {
  return {
    name: "bracketedSpan",
    tokenize: tokenizeBracketedSpanEnd,
    resolveAll: resolveAllBracketedSpans,
    resolveTo: resolveToBracketedSpanEnd,
  };
}

/** @type {Resolver} */
function resolveAllBracketedSpans(events) {
  /** @type {Array<Event>} */
  const newEvents = [];
  for (const [index, [_action, event]] of events.entries()) {
    const toDelete = [
      types.bracketedSpanContentMarker,
      types.bracketedSpanAttributesMarker,
      types.bracketedSpanAttributeValueLiteral,
      types.bracketedSpanAttributeValueMarker,
      types.bracketedSpanAttributeInitializer,
      types.bracketedSpanAttribute,
      types.bracketedSpanAttributeId,
      types.bracketedSpanAttributeId + "Marker",
      types.bracketedSpanAttributeClass,
      types.bracketedSpanAttributeClass + "Marker",
    ];
    if (toDelete.includes(event.type)) {
      continue;
    }
    newEvents.push(events[index]);
  }
  if (events.length !== newEvents.length) {
    splice(events, 0, events.length, newEvents);
  }
  return events;
}

/** @type {Resolver} */
function resolveToBracketedSpanEnd(events, context) {
  /** @type {number} */
  let index = events.length;
  /** @type {number} */
  let linkCount = 0;
  /** @type {number} */
  let bracketedSpanCount = 0;
  /** @type {number | undefined} */
  let enterStart;
  /** @type {number | undefined} */
  let exitStart;
  /** @type {number | undefined} */
  let enterEnd;
  /** @type {number | undefined} */
  let exitEnd;

  while (index--) {
    const [action, event] = events[index];
    if (event.type === builtinTypes.link) {
      if (action === "exit") {
        linkCount++;
      } else {
        linkCount--;
      }
    }
    if (event.type === types.bracketedSpanContentEnd) {
      if (action === "exit") {
        bracketedSpanCount += 1;
        exitEnd = index;
      } else {
        if (bracketedSpanCount === 1) {
          enterEnd = index;
        }
      }
    }
    if (event.type === builtinTypes.labelLink) {
      if (action === "enter") {
        if (linkCount === 0 && bracketedSpanCount === 1) {
          enterStart = index;
          break;
        } else {
          bracketedSpanCount -= 1;
        }
      } else {
        if (linkCount === 0 && bracketedSpanCount === 1) {
          exitStart = index;
        }
      }
    }
  }
  assert(enterStart !== undefined, "`enterStart` is supposed to be found");
  assert(exitStart !== undefined, "`exitStart` is supposed to be found");
  assert(enterEnd !== undefined, "`enterEnd` is supposed to be found");
  assert(exitEnd !== undefined, "`exitEnd` is supposed to be found");
  assert(exitStart - enterStart === 3, "`startLength` is supposed to be 3");

  const group = {
    type: types.bracketedSpan,
    start: { ...events[enterStart][1].start },
    end: { ...events[exitEnd][1].end },
  };
  const content = {
    type: types.bracketedSpanContent,
    start: { ...events[exitStart + 1][1].start },
    end: { ...events[enterEnd - 1][1].end },
  };

  /** @type {Array<Event>} */
  let media;

  // Content start marker.
  // const markerStart = events[enterStart + 1][1];
  // markerStart.type = types.bracketedSpanContentMarker;

  // Media.
  media = [
    ["enter", group, context],
    // ["enter", markerStart, context],
    // ["exit", markerStart, context],
    // ["enter", content, context],
  ];

  // Always populated by defaults.
  assert(
    context.parser.constructs.insideSpan.null,
    "expected `insideSpan.null` to be populated"
  );

  // Between.
  media = push(
    media,
    resolveAll(
      context.parser.constructs.insideSpan.null,
      events.slice(exitStart + 1, enterEnd),
      context
    )
  );

  // Text close, marker close, label close.
  media = push(media, [
    ...events.slice(enterEnd + 3, exitEnd),
    ["exit", group, context],
  ]);

  splice(events, enterStart, exitEnd + 1, media);

  return events;
}

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeBracketedSpanEnd(effects, ok, nok) {
  const self = this;

  /** @type {Token} */
  let index = self.events.length;
  let bracketedSpanStart;
  while (index--) {
    const [action, event] = self.events[index];

    if (action === "exit" && event.type === builtinTypes.labelLink) {
      bracketedSpanStart = event;
      break;
    }
  }

  return start;

  /** @type {State} */
  function start(code) {
    assert(code === codes.rightSquareBracket, "expected `]`");

    // If there is no start, that's not okay.
    if (!bracketedSpanStart) {
      return nok(code);
    }

    effects.enter(types.bracketedSpanContentEnd);
    effects.enter(types.bracketedSpanContentMarker);
    effects.consume(code);
    effects.exit(types.bracketedSpanContentMarker);
    return afterLabel;
  }

  /** @type {State} */
  function afterLabel(code) {
    return code === codes.leftCurlyBrace
      ? factoryAttributes.call(
          self,
          effects,
          afterAttributes,
          nok,
          types.bracketedSpanAttributes,
          types.bracketedSpanAttributesMarker,
          types.bracketedSpanAttribute,
          types.bracketedSpanAttributeId,
          types.bracketedSpanAttributeClass,
          types.bracketedSpanAttributeName,
          types.bracketedSpanAttributeInitializer,
          types.bracketedSpanAttributeValueLiteral,
          types.bracketedSpanAttributeValue,
          types.bracketedSpanAttributeValueMarker,
          types.bracketedSpanAttributeValueData,
          false
        )(code)
      : nok(code);
  }

  /** @type {State} */
  function afterAttributes() {
    effects.exit(types.bracketedSpanContentEnd);
    return ok;
  }
}
