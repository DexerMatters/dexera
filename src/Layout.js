import { useEffect, useState } from "react";
import { Flex, Heading, Text } from "rebass";
import Template from "./pages/Template";
import { AnimatedFlex } from "./components/Animation";
import { useSpring } from "@react-spring/web";
import { useParams } from "react-router-dom";

const columns = ["Home", "Notes", "Works", "About"];

export default function Layout({ children }) {
  let [ctg, setCtg] = useState([]);
  const query = new URLSearchParams(this.props.location.search);
  const path = query.get("path");
  console.log(path);
  let index = 0;
  useEffect(() => {
    fetch("http://localhost:3001/catergory")
      .then(response => response.json())
      .then(data => setCtg(data))
      .catch(error => console.error(error));
  }, [])
  console.log(ctg);
  return (
    <Flex pt={3} bg='white' alignItems='stretch' width='100%' height='100vh'>
      <Flex pl={3} flex={1} flexDirection='column' alignItems='stretch'>
        <Heading fontSize={5} mb={2}>
          Dex<font color="purple">era</font>
        </Heading>
        {
          ctg.length !== 0 && generateList(ctg, path)
        }
      </Flex>
      <Flex ml={1} pl={3} flex={3.5} sx={{ borderLeft: "3px dashed purple" }}>

      </Flex>
    </Flex>
  )
}


function generateList(ctg, path, level = 0, foreLevel = 0) {
  if (ctg === undefined || ctg.length === 0)
    return []
  let contains = path.indexOf(ctg[0].path) == 0;
  return []
    .concat(
      <Heading
        key={ctg[0]["path"]}
        fontFamily='sans-serif'
        maxHeight='100%'
        pl={level > 0 ? 1 : 0}
        pt={level > 0 ? 1 : 2}
        fontSize={level > 0 ? 1 : 2}
        fontWeight={level > 0 ? 400 : 900}
        sx={{ borderLeft: level > 0 ? "3px solid purple" : '' }}
      >
        <Text
          p={1}
          backgroundColor={contains ? "purple" : "white"}
          color={contains ? "white" : "black"}>
          {ctg[0]["title"]}
        </Text>


        {contains ?
          generateList(ctg[0].sub, path, level + 1, level) : []}
      </Heading>
    )
    .concat(
      ctg.length > 1 ?
        generateList(ctg.slice(1), path, level, foreLevel) : []
    )
}