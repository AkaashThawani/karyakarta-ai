import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

interface ContentRendererProps {
  content: string;
}

// ============================================================================
// GENERIC FORMAT-BASED DESIGN SYSTEM - Zero Hardcoding
// ============================================================================

/**
 * Detects URLs in text
 */
function isURL(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/;
  return urlPattern.test(text.trim());
}

/**
 * Detects image URLs
 */
function isImageURL(text: string): boolean {
  if (!isURL(text)) return false;
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(text);
}

/**
 * Processes text for markdown-like formatting
 * Supports: **bold**, *italic*, __highlight__
 */
function parseTextFormatting(text: string): JSX.Element[] {
  const parts: JSX.Element[] = [];
  let currentIndex = 0;
  let key = 0;

  // Pattern: **bold**, *italic*, __highlight__, `code`
  const pattern = /(\*\*.*?\*\*|\*.*?\*|__.*?__|`.*?`)/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before match
    if (match.index > currentIndex) {
      parts.push(
        <span key={key++}>{text.slice(currentIndex, match.index)}</span>
      );
    }

    const matched = match[0];
    
    // Bold: **text**
    if (matched.startsWith('**') && matched.endsWith('**')) {
      parts.push(
        <strong key={key++} className="font-bold text-gray-900 dark:text-gray-100">
          {matched.slice(2, -2)}
        </strong>
      );
    }
    // Italic: *text*
    else if (matched.startsWith('*') && matched.endsWith('*')) {
      parts.push(
        <em key={key++} className="italic text-gray-700 dark:text-gray-300">
          {matched.slice(1, -1)}
        </em>
      );
    }
    // Highlight: __text__
    else if (matched.startsWith('__') && matched.endsWith('__')) {
      parts.push(
        <mark key={key++} className="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded">
          {matched.slice(2, -2)}
        </mark>
      );
    }
    // Code: `text`
    else if (matched.startsWith('`') && matched.endsWith('`')) {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono text-red-600 dark:text-red-400">
          {matched.slice(1, -1)}
        </code>
      );
    }

    currentIndex = match.index + matched.length;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(
      <span key={key++}>{text.slice(currentIndex)}</span>
    );
  }

  return parts.length > 0 ? parts : [<span key={0}>{text}</span>];
}

/**
 * Long text component with expand/collapse
 */
function LongTextRenderer({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div>
      <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
        {expanded ? parseTextFormatting(text) : parseTextFormatting(text.slice(0, 200) + '...')}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1"
      >
        {expanded ? (
          <>
            <ChevronDown className="w-3 h-3" />
            Show less
          </>
        ) : (
          <>
            <ChevronRight className="w-3 h-3" />
            Read more
          </>
        )}
      </button>
    </div>
  );
}

/**
 * VALUE FORMATTER - Handles all primitive types with smart detection
 */
function ValueFormatter({ value, depth = 0 }: { value: any; depth?: number }): JSX.Element {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic text-sm">null</span>;
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        value 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      }`}>
        {value ? '✓ True' : '✗ False'}
      </span>
    );
  }

  // Handle numbers
  if (typeof value === 'number') {
    return <span className="font-mono text-sm text-purple-600 dark:text-purple-400">{value.toLocaleString()}</span>;
  }

  // Handle strings
  if (typeof value === 'string') {
    const trimmed = value.trim();
    
    // Empty string
    if (!trimmed) {
      return <span className="text-gray-400 italic text-sm">empty</span>;
    }

    // Image URL - display inline
    if (isImageURL(trimmed)) {
      return (
        <div className="my-2">
          <img 
            src={trimmed} 
            alt="Content" 
            className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <a
            href={trimmed}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1"
          >
            {trimmed}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      );
    }

    // Regular URL - make clickable
    if (isURL(trimmed)) {
      const href = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-1 break-all"
        >
          {trimmed}
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </a>
      );
    }

    // Long text (>200 chars) - add read more
    if (trimmed.length > 200) {
      return <LongTextRenderer text={trimmed} />;
    }

    // Regular text with formatting support
    return (
      <span className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
        {parseTextFormatting(trimmed)}
      </span>
    );
  }

  // Fallback
  return <span className="text-gray-600 dark:text-gray-400">{String(value)}</span>;
}

/**
 * Detects if array contains question/quiz-like data
 */
function isQuestionData(data: any[]): boolean {
  if (!Array.isArray(data) || data.length === 0) return false;
  if (typeof data[0] !== 'object' || data[0] === null) return false;
  
  // Check if objects have question-like field names
  const firstKeys = Object.keys(data[0]).map(k => k.toLowerCase());
  const hasQuestion = firstKeys.some(k => 
    k.includes('question') || k.includes('q') || k.includes('query')
  );
  const hasAnswer = firstKeys.some(k => 
    k.includes('answer') || k.includes('a') || k.includes('solution')
  );
  const hasOptions = firstKeys.some(k => 
    k.includes('option') || k.includes('choice') || k.includes('choices')
  );
  
  // Must have question field, and either answers or options
  return hasQuestion && (hasAnswer || hasOptions);
}

/**
 * QUESTION CARD RENDERER - Renders quiz questions as cards
 */
function QuestionCardRenderer({ data, depth = 0 }: { data: any[]; depth?: number }): JSX.Element {
  return (
    <div className={`space-y-4 my-3 ${depth > 0 ? 'ml-4' : ''}`}>
      {data.map((item, index) => {
        // Find question, options, and answer fields dynamically
        const entries = Object.entries(item);
        const questionField = entries.find(([k]) => 
          k.toLowerCase().includes('question') || k.toLowerCase() === 'q'
        );
        const optionsField = entries.find(([k]) => 
          k.toLowerCase().includes('option') || k.toLowerCase().includes('choice')
        );
        const answerField = entries.find(([k]) => 
          k.toLowerCase().includes('answer') || k.toLowerCase() === 'a'
        );
        
        const questionText = questionField ? String(questionField[1]) : '';
        const options = optionsField && typeof optionsField[1] === 'string' 
          ? optionsField[1].split(',').map(o => o.trim())
          : Array.isArray(optionsField?.[1]) 
            ? optionsField[1] 
            : [];
        const answer = answerField ? String(answerField[1]) : '';
        
        return (
          <div key={index} className="space-y-2 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
            {/* Question */}
            <div className="flex gap-2">
              <span className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                Q{index + 1}.
              </span>
              <span className="text-gray-800 dark:text-gray-200">
                {questionText}
              </span>
            </div>
            
            {/* Options */}
            {options.length > 0 && (
              <div className="ml-8 space-y-1">
                {options.map((option, i) => {
                  const isCorrect = String(option).trim() === answer.trim();
                  return (
                    <div key={i} className="flex gap-2">
                      <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span className={isCorrect ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}>
                        {String(option).trim()}
                        {isCorrect && <span className="ml-2 text-green-600 dark:text-green-400">✓</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Answer (if no options to mark) */}
            {answer && options.length === 0 && (
              <div className="ml-8 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Answer:</span>{' '}
                <span className="text-gray-900 dark:text-gray-100">{answer}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * ARRAY FORMATTER - Handles all array types with smart pattern detection
 */
function ArrayFormatter({ data, depth = 0 }: { data: any[]; depth?: number }): JSX.Element {
  // Empty array
  if (data.length === 0) {
    return <span className="text-gray-400 italic text-sm">Empty list</span>;
  }

  // Array of primitives - render as nested list
  if (typeof data[0] !== 'object' || data[0] === null) {
    return (
      <ul className={`space-y-1 my-2 ${depth > 0 ? 'ml-4' : ''}`}>
        {data.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-gray-600 dark:text-gray-400 mt-1">•</span>
            <div className="flex-1">
              <ValueFormatter value={item} depth={depth + 1} />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  // Check for question/quiz pattern first (before table detection)
  if (isQuestionData(data)) {
    return <QuestionCardRenderer data={data} depth={depth} />;
  }

  // Array of objects with same keys - render as table
  const firstKeys = Object.keys(data[0]).sort();
  const isUniformObjects = data.every(item => {
    if (typeof item !== 'object' || item === null) return false;
    const keys = Object.keys(item).sort();
    return keys.length === firstKeys.length && 
           keys.every((key, i) => key === firstKeys[i]);
  });

  if (isUniformObjects) {
    return <TableFormatter data={data} depth={depth} />;
  }

  // Array of objects with different keys - render as nested list
  return (
    <div className={`space-y-3 my-3 ${depth > 0 ? 'ml-4' : ''}`}>
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {i + 1}.
          </div>
          <DynamicRenderer data={item} depth={depth + 1} />
        </div>
      ))}
    </div>
  );
}

/**
 * TABLE FORMATTER - Renders uniform arrays as tables
 */
function TableFormatter({ data, depth = 0 }: { data: any[]; depth?: number }): JSX.Element {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  if (data.length === 0) return <></>;
  
  const headers = Object.keys(data[0]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  let displayData = [...data];
  if (sortColumn) {
    displayData.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * direction;
      }
      return String(aVal).localeCompare(String(bVal)) * direction;
    });
  }

  return (
    <div className="overflow-x-auto my-3 rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <tr>
            {headers.map(header => (
              <th
                key={header}
                onClick={() => handleSort(header)}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {header.replace(/_/g, ' ')}
                  {sortColumn === header && (
                    <span className="text-blue-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {displayData.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {headers.map(header => (
                <td key={header} className="px-4 py-3 text-sm">
                  <ValueFormatter value={row[header]} depth={depth + 1} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * OBJECT FORMATTER - Renders objects in label: content format
 */
function ObjectFormatter({ data, depth = 0 }: { data: Record<string, any>; depth?: number }): JSX.Element {
  const [collapsed, setCollapsed] = useState(false);
  const entries = Object.entries(data);
  
  // Empty object
  if (entries.length === 0) {
    return <span className="text-gray-400 italic text-sm">Empty object</span>;
  }

  return (
    <div className={`space-y-2 ${depth > 0 ? 'ml-4' : ''}`}>
      {entries.map(([key, value], index) => {
        // Format key to be readable
        const displayKey = key
          .replace(/_/g, ' ')
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        const isNested = typeof value === 'object' && value !== null;
        const isPrimitive = !isNested;

        // Label: content format for primitives
        if (isPrimitive) {
          return (
            <div key={key} className="flex gap-1">
              <span className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                {displayKey}:
              </span>
              <div className="flex-1">
                <DynamicRenderer data={value} depth={depth + 1} />
              </div>
            </div>
          );
        }

        // Section format for nested objects/arrays
        return (
          <div key={key} className="space-y-1">
            <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide">
              {displayKey}
              {Array.isArray(value) && (
                <span className="text-xs text-gray-500 normal-case ml-1">
                  ({value.length} items)
                </span>
              )}
            </div>
            <DynamicRenderer data={value} depth={depth + 1} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * DYNAMIC RENDERER - Routes to appropriate formatter based on type
 */
function DynamicRenderer({ data, depth = 0 }: { data: any; depth?: number }): JSX.Element {
  // Primitives and special values
  if (data === null || data === undefined || typeof data !== 'object') {
    return <ValueFormatter value={data} depth={depth} />;
  }

  // Arrays
  if (Array.isArray(data)) {
    return <ArrayFormatter data={data} depth={depth} />;
  }

  // Objects
  return <ObjectFormatter data={data} depth={depth} />;
}

/**
 * Main preprocessing function - detects if content is JSON
 */
function preprocessContent(content: string): { type: 'json' | 'markdown'; data: any } {
  const trimmedContent = content.trim();
  
  // Try to parse as JSON
  if (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmedContent);
      return { type: 'json', data: parsed };
    } catch (e) {
      // Not valid JSON, treat as markdown
    }
  }
  
  // Not JSON, return as markdown
  return { type: 'markdown', data: trimmedContent };
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
        className="absolute right-2 top-2 p-2 rounded bg-gray-700 hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
  const processed = preprocessContent(content);
  
  // If JSON detected, render with format-based system
  if (processed.type === 'json') {
    return (
      <div className="my-3">
        <DynamicRenderer data={processed.data} depth={0} />
      </div>
    );
  }
  
  // Otherwise render as markdown
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-pre:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
            />
          ),
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
          p: ({ node, ...props }) => (
            <p className="leading-relaxed" {...props} />
          ),
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
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-1" {...props} />
          ),
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold mt-3 mb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-bold mt-2 mb-1" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-2"
              {...props}
            />
          ),
        }}
      >
        {processed.data}
      </ReactMarkdown>
    </div>
  );
}
