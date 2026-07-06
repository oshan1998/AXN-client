import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownMessageProps {
  content: string;
  isUser: boolean;
}

function buildComponents(isUser: boolean): Components {
  const linkClass = isUser ? "text-white underline underline-offset-2" : "text-accent underline underline-offset-2";
  const codeClass = isUser ? "bg-white/15" : "bg-surface-muted";

  return {
    p: ({ children }) => <p className="whitespace-pre-wrap [&:not(:last-child)]:mb-2">{children}</p>,
    a: ({ children, ...props }) => (
      <a {...props} target="_blank" rel="noreferrer" className={linkClass}>
        {children}
      </a>
    ),
    img: ({ src, alt }) =>
      typeof src === "string" ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary remote host from workspace files, unknown dimensions
        <img src={src} alt={alt ?? ""} className="my-1 max-w-full rounded-lg" />
      ) : null,
    ul: ({ children }) => <ul className="mb-2 list-disc space-y-0.5 pl-5">{children}</ul>,
    ol: ({ children }) => <ol className="mb-2 list-decimal space-y-0.5 pl-5">{children}</ol>,
    code: ({ children }) => (
      <code className={cn("rounded px-1 py-0.5 text-[12px]", codeClass)}>{children}</code>
    ),
    pre: ({ children }) => (
      <pre className={cn("mb-2 overflow-x-auto rounded-lg p-2.5 text-[12px]", codeClass)}>{children}</pre>
    ),
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  };
}

export function MarkdownMessage({ content, isUser }: MarkdownMessageProps) {
  return (
    <div className="text-[13px] leading-relaxed [&>*:last-child]:mb-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={buildComponents(isUser)}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
