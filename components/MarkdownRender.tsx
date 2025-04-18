'use client'

import { useState, useCallback } from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneLight, atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { useTheme } from 'next-themes'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'

const CodeBlock: Components['code'] = ({ children, className, ...rest }) => {
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')

  const handleCopy = useCallback(() => {
    if (typeof children === 'string') {
      navigator.clipboard.writeText(children)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [children])

  return match ? (
    <div className="w-full rounded overflow-hidden my-4">
      <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-2 flex justify-between items-center">
        <span className="text-sm font-mono">{match?.[1]}</span>

        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
        >
          {copied ? 'copied!' : 'copy'}
        </button>
      </div>

      <SyntaxHighlighter
        PreTag="div"
        language={match[1]}
        style={theme === 'dark' ? atomOneDark : atomOneLight}
        customStyle={{ margin: 0, borderRadius: 0 }}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code {...rest} className={`${className} bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded`}>
      {children}
    </code>
  )
}

// const ImageRenderer: Components['img'] = ({ src, alt, ...props }) => {
//   return (
//     <div className="flex flex-col items-center my-4">
//       <img src={src} alt={alt} className="max-w-full rounded shadow-md" loading="lazy" {...props} />
//       {alt && <span className="text-sm text-gray-500 mt-2">{alt}</span>}
//     </div>
//   )
// }

const LinkRenderer: Components['a'] = ({ href, children, ...props }) => {
  const isExternal = href?.startsWith('http')

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="text-blue-600 dark:text-blue-400 hover:underline"
      {...props}
    >
      {children}
    </a>
  )
}

function MarkdownRender({ content }: { content: string }) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          code: CodeBlock,
          // img: ImageRenderer,
          a: LinkRenderer,
          h1: (props) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
          h2: (props) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
          h3: (props) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
          ul: (props) => <ul className="list-disc pl-6 my-4" {...props} />,
          ol: (props) => <ol className="list-decimal pl-6 my-4" {...props} />,
          p: (props) => <p className="my-3" {...props} />
        }}
        rehypePlugins={[rehypeKatex]}
        remarkPlugins={[remarkGfm, remarkMath]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRender
