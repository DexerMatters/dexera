import { Box, Flex, Heading } from "rebass";

export default function Template({ header, isFile, content }) {
  return (
    <Flex paddingBottom='40%' paddingLeft='2rem' paddingRight='2rem' flexDirection='column' height='100vh' width='100%' overflowY='scroll'>
      <Heading
        p={0}
        opacity={0.3}
        fontSize={isFile ? "4em" : "8em"}
        color="purple"
        sx={{ position: "relative", userSelect: 'none' }}
      >
        {isFile ? header.slice(0, header.length - 3) : header}
      </Heading>
      <Box mt={isFile || "-4.5em"} dangerouslySetInnerHTML={{ __html: content }} />
    </Flex >
  )
}