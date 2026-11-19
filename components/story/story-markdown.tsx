import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {Children} from "react";
import type {ReactNode} from "react";
import {sectionId} from "@/lib/articles";

type HastNode = {type: string; tagName?: string; value?: string; children?: HastNode[]};
const hastText = (n: HastNode): string => n.type === "text" ? n.value ?? "" : (n.children ?? []).map(hastText).join("");

const link = ({href = "", children}: {href?: string; children?: ReactNode}) => {
  if (href.startsWith("/") && !href.startsWith("//")) return <Link href={href} prefetch={false}>{children}</Link>;
  return <a href={href} {...(/^https?:\/\//.test(href) ? {target: "_blank", rel: "noopener noreferrer"} : {})}>{children}</a>;
};

/**
 * Story Markdown: raw HTML is never rendered. Images (https only) become tilted white-print photo breaks captioned
 * from the title, else the alt text; a blockquote is a large pull quote (a last line starting with "—" is its credit).
 * `inline` renders just the text of one paragraph (principle cards).
 */
export function StoryMarkdown({text, inline = false}: {text: string; inline?: boolean}) {
  return <div className={inline ? "sty-md sty-inline" : "sty-md"}><ReactMarkdown skipHtml components={{
    a: link,
    h2: ({children}) => <h2>{children}</h2>,
    h3: ({children}) => <h3 id={sectionId(String(Children.toArray(children).join("")))}>{children}</h3>,
    img: ({src, alt, title}) => {
      const s = typeof src === "string" ? src : "";
      if (inline || !/^https:\/\//.test(s)) return null;
      const caption = (title || alt || "").trim();
      return <figure className="sty-brk sty-rv"><div className="sty-print"><div className="sty-ph">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s} alt={alt ?? ""} loading="lazy" decoding="async" referrerPolicy="no-referrer"/>
      </div></div>{caption ? <figcaption>{caption}</figcaption> : null}</figure>;
    },
    p: ({node, children}) => {
      const kids = ((node as HastNode | undefined)?.children ?? []).filter(c => !(c.type === "text" && !(c.value ?? "").trim()));
      if (inline || (kids.length === 1 && kids[0].type === "element" && kids[0].tagName === "img")) return <>{children}</>;
      return <p>{children}</p>;
    },
    blockquote: ({node, children}) => {
      const paras = ((node as HastNode | undefined)?.children ?? []).filter(c => c.type === "element" && c.tagName === "p");
      const last = paras[paras.length - 1];
      const credit = last && /^\s*(—|–|--)\s*\S/.test(hastText(last)) ? hastText(last).replace(/^\s*(—|–|--)\s*/, "").trim() : "";
      const parts = Children.toArray(children).filter(c => typeof c !== "string" || c.trim());
      return <figure className="sty-pq sty-rv"><blockquote>{credit ? parts.slice(0, -1) : parts}</blockquote>{credit ? <figcaption>{credit}</figcaption> : null}</figure>;
    },
  }}>{text}</ReactMarkdown></div>;
}
