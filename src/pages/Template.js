import { Box, Flex, Heading } from "rebass";

export default function Template({ header, isFile, content }) {
  return (
    <Flex flexDirection='column' height='100%' width='90%'>
      <Box mt="3em" dangerouslySetInnerHTML={{ __html: content }} />
      <Heading
        p={0}
        opacity={0.3}
        mt="-0.2em"
        fontSize={isFile ? "4em" : "8em"}
        color="purple"
        sx={{ position: "absolute", userSelect: 'none' }}
      >
        {isFile ? header.slice(0, header.length - 3) : header}
      </Heading>
    </Flex>
  )
}