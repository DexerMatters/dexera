import { useEffect, useState } from "react";
import { Flex, Heading, Text } from "rebass";
import Template from "./pages/Template";
import { Link, useSearchParams } from "react-router-dom";

export default function Layout({ ctg, api }) {
  let [data, setData] = useState({ ctg: ctg, content: "" });
  let [query] = useSearchParams();
  let path = decodeURIComponent(query.get("path"));

  useEffect(() => {
    let mData = { ctg: ctg, content: "" };
    fetch(api + "/content?path=" + encodeURIComponent(path))
      .then(response => response.text())
      .then(data => mData.content = data)
      .then(() => setData(mData))
      .catch(err => console.error(err))
  }, [path, ctg])

  console.log(path)
  console.log(data);
  return (
    <Flex pt={3} bg='white' alignItems='stretch' width='100%' height='100vh' overflowX='clip'>
      <Flex pl={3} flex={1} flexDirection='column' alignItems='stretch'>
        <Heading fontSize={5} mb={2}>
          Dex<font color="purple">era</font>
        </Heading>
        {
          data.ctg.length !== 0 && generateList(data.ctg, path)
        }
      </Flex>
      <Flex ml={1} pl={3} flex={3.5} sx={{ borderLeft: "3px dashed purple" }}>
        <Template isFile={path.endsWith(".md")} header={
          path.slice(path.lastIndexOf('/') + 1)
        } content={data.content} />
      </Flex>
    </Flex>
  )
}


function generateList(ctg, path, level = 0, foreLevel = 0) {
  if (ctg === undefined || ctg.length === 0)
    return []
  const contains = path.indexOf(ctg[0].path) === 0;
  const hasSub = ctg[0].sub.length >= 1;
  const isMd = ctg[0]["title"].endsWith(".md");
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
        <Link to={"/s/?path=" + encodeURIComponent(ctg[0].path)} style={{ textDecoration: 'none' }}>
          <Text
            p={1}
            backgroundColor={contains ? (hasSub ? "purple" : "grey") : "white"}
            color={contains ? "white" : "black"}>
            {
              isMd ?
                ctg[0]["title"].slice(0, ctg[0]["title"].length - 3) :
                ctg[0]["title"]
            }
          </Text>
        </Link>
        {
          contains && hasSub ?
            generateList(
              ctg[0].sub.filter(e => e.title !== "index.md"), //hide index.md
              path,
              level + 1,
              level) : []
        }
      </Heading>
    )
    .concat(
      ctg.length > 1 ?
        generateList(ctg.slice(1), path, level, foreLevel) : []
    )
}