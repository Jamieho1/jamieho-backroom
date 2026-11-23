import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { Options } from "react-markdown";

/**
 * Safe Markdown for site content: raw HTML in the text is never rendered (react-markdown escapes it),
 * and links to other sites open in a new tab without access to this page.
 */
export function Markdown({ text, disableLinks = false, rehypePlugins }: { text: string; disableLinks?: boolean; rehypePlugins?: Options["rehypePlugins"] }) {
  return (
    <div className="md">
      <ReactMarkdown
        skipHtml
        rehypePlugins={rehypePlugins}
        components={{
          a: ({ href = "", children, title }) => {
            if (disableLinks) return <>{children}</>;
            const external = /^https?:\/\//.test(href);
            // Inline reference chips (C4) arrive as internal links titled "iv-chip"; the title itself is never shown.
            if(href.startsWith("/")&&!href.startsWith("//"))return <Link href={href} prefetch={false} className={title==="iv-chip"?"iv-chip":undefined}>{children}</Link>;
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {children}
              </a>
            );
          },
          img: () => null,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
