import Markdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import { atelierForestLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Box, Flex, Heading } from "rebass";
import remarkMath from "remark-math";
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

export default function Template({ header, content }) {
  return (
    <Flex flexDirection='column' height='100%' width='90%'>
      <Heading
        p={0}
        opacity={0.3}
        mt="-0.2em"
        fontSize="8em"
        color="purple"
        sx={{ position: "absolute" }}
      >
        {header}
      </Heading>
      <Box mt="3em">
        <Markdown
          children={content}
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h3(props) {
              const { node, ...rest } = props
              return <h3 style={{
                borderLeft: '3px solid purple',
                paddingLeft: '8px'
              }} {...rest} />
            },
            p(props) {
              const { node, ...rest } = props
              return <p style={{
                paddingLeft: "8px",
                fontFamily: 'serif',
                lineHeight: '1.5em'
              }} {...rest} />
            },
            ul(props) {
              const { node, ...rest } = props
              return <ul style={{
                marginLeft: "8px",
                fontFamily: 'serif',
                lineHeight: '1.5em'
              }} {...rest} />
            },
            blockquote(props) {
              const { node, ...rest } = props
              return <blockquote style={{
                padding: '2px 8px 2px 8px',
                color: 'rgb(73, 54, 72)',
                borderLeft: '3px solid purple',
                backgroundColor: 'rgb(244, 236, 245)'
              }} {...rest} />
            },
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
                <code style={{
                  fontSize: '0.85em',
                  backgroundColor: 'rgb(244, 236, 245)',
                  padding: '3px',
                  borderRadius: '10%'
                }} {...rest} className={className}>
                  {children}
                </code>
              )
            }
          }}
        />
      </Box>
    </Flex>
  )
}