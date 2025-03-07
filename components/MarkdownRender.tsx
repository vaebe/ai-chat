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

  const match = /language-(\w+)/.exec(className || '')

  return match ? (
    <div className="w-full rounded overflow-hidden">
      <div className="bg-black dark:bg-white text-white dark:text-black p-1">
        <p>{match?.[1]}</p>
      </div>

      <SyntaxHighlighter
        PreTag="div"
        language={match[1]}
        style={theme === 'dark' ? atomOneDark : atomOneLight}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code {...rest} className={className}>
      {children}
    </code>
  )
}

function MarkdownRender({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        code: CodeBlock
      }}
      rehypePlugins={[rehypeKatex]}
      remarkPlugins={[remarkGfm, remarkMath]}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownRender
