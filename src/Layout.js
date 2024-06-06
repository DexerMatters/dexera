import { useEffect, useState } from "react";
import { Flex, Heading, Text, Box } from "rebass";
import Template from "./pages/Template";
import { Link, useSearchParams } from "react-router-dom";
import { useMediaQuery } from "@react-hook/media-query";
import Logo from './components/Miscs';
import { AnimatedFlex } from "./components/Animation";
import { Menu } from "react-feather";

let cache = [];

export default function Layout({ ctg, api }) {
  let [data, setData] = useState({ ctg: ctg, content: "" });
  let [hasExtended, extend] = useState(false);
  let [loading, setLoading] = useState(false);
  let [query] = useSearchParams();

  let path = decodeURIComponent(query.get("path"));
  let isDesktop = useMediaQuery("(min-width: 960px)");

  useEffect(() => {
    let mData = { ctg: ctg, content: "" };
    if (loading) {
      let f = cache.find(v => v[path] !== undefined)
      console.log(f);
      if (f) {
        setData({ ctg: ctg, content: f[path] })
        setLoading(false);
      }
      else
        fetch(api + "/content?path=" + encodeURIComponent(path))
          .then(response => response.text())
          .then(data => {
            mData.content = data;
            if (!cache.find(v => v[path] !== undefined)) {
              let obj = {};
              obj[path] = data;
              cache.push(obj);
            }
          })
          .then(() => setData(mData))
          .then(() => setLoading(false))
          .catch(err => console.error(err));
    };
    return () => { if (!loading) setLoading(true); }
  }, [ctg, loading, path, api]);

  // When it is shwon on desktop
  if (isDesktop)
    return (
      <Flex
        pt={3}
        bg='white'
        alignItems='stretch'
        width='100%'
        height='100vh'
        overflow='clip'>
        <Flex pl={3} flex={1} flexDirection='column' alignItems='stretch'>
          <Logo />
          {
            data.ctg.length !== 0 && generateList(data.ctg, path)
          }
        </Flex>
        <Flex ml={1} pl={3} flex={3.5} sx={{ borderLeft: "3px dashed purple" }}>
          <Template
            isFile={path.endsWith(".md")}
            isLoading={loading}
            header={
              path.slice(path.lastIndexOf('/') + 1)
            }
            content={data.content} />
        </Flex>
      </Flex>
    )

  // When it is shown on phone
  return (
    <Flex
      bg='white'
      flexDirection='column'
      alignItems='stretch'
      width='100%'
      height='100vh'
      overflow='clip'>
      {
        hasExtended &&
        <Flex
          bg='rgba(255, 255, 255, 0.7)'
          width='100vw'
          height='100vh'
          style={{ position: 'absolute', zIndex: 600 }}
        >
          <AnimatedFlex
            bg='white'
            width='70vw'
            flexDirection='column'
            sx={{
              boxShadow: '1px 1px 32px black',
            }}>
            <Logo pt={2} />
            <Box px={2}>
              {
                data.ctg.length !== 0 && generateList(data.ctg, path)
              }
            </Box>
          </AnimatedFlex>
          <Box width='30vw' onClick={() => { extend(false) }} />
        </Flex>
      }
      <Flex
        mt={3}
        height='32px'
        alignItems='center'
        justifyItems='stretch'
        justifyContent='space-between'>
        <Logo pb={1} />
        <Menu
          style={{ paddingBottom: '8px', paddingRight: '8px' }}
          size='28px'
          color="purple"
          onClick={() => extend(true)} />
      </Flex>
      <Flex flex={1} ml={1} pl={3} sx={{ borderTop: "3px dashed purple" }}>
        <Template
          isFile={path.endsWith(".md")}
          isLoading={loading}
          isMobile={true}
          header={
            path.slice(path.lastIndexOf('/') + 1)
          }
          content={data.content} />
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
        <Link
          to={"/s/?path=" + encodeURIComponent(ctg[0].path)}
          style={{ textDecoration: 'none' }}>
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