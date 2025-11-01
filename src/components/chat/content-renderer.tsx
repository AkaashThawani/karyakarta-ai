import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface ContentRendererProps {
  content: string;
}

function convertJsonToMarkdownTable(jsonStr: string): string {
  /**
   * Detect and convert JSON tables to markdown tables
   * Handles multiple formats including nested structures
   */
  try {
    const parsed = JSON.parse(jsonStr);
    
    // Format 1: Nested table with headers and rows
    // { "table": { "headers": ["A", "B"], "rows": [[1,2], [3,4]] } }
    if (parsed.table && typeof parsed.table === 'object' && !Array.isArray(parsed.table)) {
      const tableObj = parsed.table;
      if (tableObj.headers && tableObj.rows && Array.isArray(tableObj.rows)) {
        return arrayToMarkdownTable(
          tableObj.rows.map((row: any[]) => {
            const obj: any = {};
            tableObj.headers.forEach((header: string, i: number) => {
              obj[header] = row[i];
            });
            return obj;
          })
        );
      }
    }
    
    // Format 2: Simple array in table key
    // { "table": [{"A": 1, "B": 2}, ...] }
    if (parsed.table && Array.isArray(parsed.table) && parsed.table.length > 0) {
      return arrayToMarkdownTable(parsed.table);
    }
    
    // Format 3: Direct array of objects
    // [{"A": 1, "B": 2}, ...]
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
      return arrayToMarkdownTable(parsed);
    }
    
    // Not a table format, return original
    return jsonStr;
  } catch (e) {
    return jsonStr;
  }
}

function arrayToMarkdownTable(arr: any[]): string {
  /**
   * Convert array of objects to markdown table with clickable links
   */
  if (!arr || arr.length === 0) return '';
  
  const headers = Object.keys(arr[0]);
  const headerRow = '| ' + headers.join(' | ') + ' |';
  const separatorRow = '| ' + headers.map(() => '---').join(' | ') + ' |';
  
  const dataRows = arr.map(item => {
    const values = headers.map(header => {
      const value = item[header];
      const strValue = String(value || '');
      
      // Enhanced URL detection - catches domains, www., http://, https://
      // Matches: domain.com, www.domain.com, http://domain.com, https://domain.com, github.com/user/repo
      const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/;
      
      if (urlPattern.test(strValue)) {
        // Build proper URL with https:// prefix if missing
        const url = strValue.startsWith('http') ? strValue : `https://${strValue}`;
        return `[${strValue}](${url})`;
      }
      
      // Escape pipe characters in non-URL values
      return strValue.replace(/\|/g, '\\|');
    });
    return '| ' + values.join(' | ') + ' |';
  });
  
  return [headerRow, separatorRow, ...dataRows].join('\n');
}

function preprocessContent(content: string): string {
  /**
   * Preprocess content to detect and convert JSON tables to markdown
   */
  const trimmedContent = content.trim();
  
  // Check if the entire content is JSON
  if (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmedContent);
      
      // Format 1: Nested table with headers and rows
      if (parsed.table && typeof parsed.table === 'object' && !Array.isArray(parsed.table)) {
        const tableObj = parsed.table;
        if (tableObj.headers && tableObj.rows) {
          const markdownTable = arrayToMarkdownTable(
            tableObj.rows.map((row: any[]) => {
              const obj: any = {};
              tableObj.headers.forEach((header: string, i: number) => {
                obj[header] = row[i];
              });
              return obj;
            })
          );
          if (markdownTable) return markdownTable;
        }
      }
      
      // Format 2: Simple array in table key
      if (parsed.table && Array.isArray(parsed.table) && parsed.table.length > 0) {
        const markdownTable = arrayToMarkdownTable(parsed.table);
        if (markdownTable) return markdownTable;
      }
      
      // Format 3: Direct array of objects
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
        const markdownTable = arrayToMarkdownTable(parsed);
        if (markdownTable) return markdownTable;
      }
    } catch (e) {
      // Not valid JSON, continue
    }
  }
  
  // Pattern to detect JSON code blocks
  const jsonBlockPattern = /```json\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/g;
  
  let processed = content.replace(jsonBlockPattern, (match, jsonContent) => {
    const converted = convertJsonToMarkdownTable(jsonContent);
    return converted !== jsonContent ? converted : match;
  });
  
  return processed;
}

function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-2 rounded bg-gray-700 hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-gray-300" />
        )}
      </button>
      <SyntaxHighlighter
        language={language || 'text'}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
        }}
        showLineNumbers={language !== 'text'}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

export function ContentRenderer({ content }: ContentRendererProps) {
  const processedContent = preprocessContent(content);
  
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-pre:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Customize link rendering
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
            />
          ),
          // Customize code rendering with syntax highlighting
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono text-red-600 dark:text-red-400"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            return match ? (
              <CodeBlock language={match[1]}>
                {codeString}
              </CodeBlock>
            ) : (
              <code
                className="block p-3 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-x-auto font-mono text-sm"
                {...props}
              >
                {children}
              </code>
            );
          },
          // Customize paragraph
          p: ({ node, ...props }) => (
            <p className="leading-relaxed" {...props} />
          ),
          // Customize tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table
                className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50 dark:bg-gray-800" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100" {...props} />
          ),
          // Customize lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-1" {...props} />
          ),
          // Customize headings
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold mt-3 mb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-bold mt-2 mb-1" {...props} />
          ),
          // Customize blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-2"
              {...props}
            />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
