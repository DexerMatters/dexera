import Markdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import { atelierForestLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Flex, Heading } from "rebass";
import remarkMath from "remark-math";
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

export default function Template({ header, children }) {
  return (
    <Flex flexDirection='column' height='100%' width='90%'>
      <Heading fontSize={6} color="purple">{header}</Heading>
      <Markdown
        children={children}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code(props) {
            const { children, className, node, ...rest } = props
            const match = /language-(\w+)/.exec(className || '')
            return match ? (
              <SyntaxHighlighter
                {...rest}
                PreTag="div"
                children={String(children).replace(/\n$/, '')}
                language={match[1]}
                style={atelierForestLight}
                customStyle={{ fontSize: '0.85em', backgroundColor: 'white' }}
              />
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            )
          }
        }}
      />
    </Flex>
  )
}