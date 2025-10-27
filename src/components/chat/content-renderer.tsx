import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ContentRendererProps {
  content: string;
}

export function ContentRenderer({ content }: ContentRendererProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-pre:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize link rendering
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
          ),
          // Customize code rendering
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={`block p-3 rounded-lg bg-muted overflow-x-auto ${className || ''}`} {...props}>
                {children}
              </code>
            );
          },
          // Customize paragraph for better spacing
          p: ({ node, ...props }) => (
            <p className="leading-relaxed" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
