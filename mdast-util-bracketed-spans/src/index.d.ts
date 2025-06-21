import type { Parent, PhrasingContent } from "mdast";
import type { Extension as FromMarkdownExtension } from "mdast-util-from-markdown";
import type { Extension as ToMarkdownExtension } from "mdast-util-to-markdown";
import type { Extension as ToHastExtension } from "mdast-util-to-hast";
import type { Properties } from "@types/hast";

export interface BracketedSpan extends Parent {
  type: "bracketedSpan";
  children: [PhrasingContent];
  properties: Properties;
}

declare module "mdast" {
  interface PhrasingContentMap {
    bracketedSpan: BracketedSpan;
  }
  interface RootContentMap {
    bracketedSpan: BracketedSpan;
  }
}

export function bracketedSpanFromMarkdown(): FromMarkdownExtension;

export function bracketedSpanToMarkdown(): ToMarkdownExtension;

export function bracketedSpanToHast(): ToHastExtension;
