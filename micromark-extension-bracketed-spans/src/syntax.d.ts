import type { Extension } from "micromark-util-types";

export const types: {
    bracketedSpan: string,
    bracketedSpanContent: string,
    bracketedSpanContentText: string,
    bracketedSpanContentStart: string,
    bracketedSpanContentStartMarker: string,
    bracketedSpanContentEnd: string,
    bracketedSpanContentEndMarker: string,
    bracketedSpanAttributes: string,
    bracketedSpanAttributesMarker: string,
    bracketedSpanAttribute: string,
    bracketedSpanAttributeId: string,
    bracketedSpanAttributeClass: string,
    bracketedSpanAttributeName: string,
    bracketedSpanAttributeInitializer: string,
    bracketedSpanAttributeValueLiteral: string,
    bracketedSpanAttributeValue: string,
    bracketedSpanAttributeValueMarker: string,
}

export function bracketedSpanSyntax(): Extension;
