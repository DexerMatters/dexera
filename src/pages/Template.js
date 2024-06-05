import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'
import { Box, Flex, Heading } from "rebass";

export default function Template({ header, isFile, isLoading, content }) {
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
        sx={{ position: "relative", userSelect: 'none', zIndex: '100' }}
      >
        {isFile ? header.slice(0, header.length - 3) : header}
      </Heading>
      {
        !isLoading ?
          <Box mt={isFile || "-4.5em"} dangerouslySetInnerHTML={{ __html: content }} />
          :
          <Box mt={isFile || "-4.5em"} pt='25px'>
            <Skeleton height='32px' style={{ marginBottom: '16px' }} />
            <Skeleton height='16px' count={12} style={{ marginBottom: '8px' }} />
          </Box>
      }
    </Flex >
  )
}