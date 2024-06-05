import { Box, Flex, Heading } from "rebass";

export default function Template({ header, isFile, content }) {
  return (
    <Flex
      width='100%'
      height='100vh'
      pr='10%'
      pb='40%'
      pl='2rem'
      flexDirection='column'
      overflowY='scroll'>
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