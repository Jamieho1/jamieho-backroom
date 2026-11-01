import Link from "next/link";
import ReactMarkdown from "react-markdown";

/**
 * Safe Markdown for site content: raw HTML in the text is never rendered (react-markdown escapes it),
 * and links to other sites open in a new tab without access to this page.
 */
export function Markdown({ text }: { text: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        skipHtml
        components={{
          a: ({ href = "", children }) => {
            const external = /^https?:\/\//.test(href);
            if(href.startsWith("/")&&!href.startsWith("//"))return <Link href={href} prefetch={false}>{children}</Link>;
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
