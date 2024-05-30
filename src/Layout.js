import { useState } from "react";
import { Flex, Heading } from "rebass";
import Template from "./pages/Template";
import { AnimatedFlex } from "./components/Animation";
import { useSpring } from "@react-spring/web";

const columns = ["Home", "Notes", "Works", "About"];

export default function Layout({ children }) {
  let [index, setIndex] = useState(0);
  let [subIndex, setSubIndex] = useState(0);
  return (
    <Flex pt={3} bg='white' alignItems='stretch' width='100%' height='100vh'>
      <Flex pl={3} flex={1} flexDirection='column' alignItems='stretch'>
        <Heading fontSize={5} mb={2}>
          Dex<font color="purple">era</font>
        </Heading>
        {
          columns.map((name, i) => <>
            <Heading
              py={2}
              pl={1}
              fontFamily='sans-serif'
              fontSize={2}
              color={i === index && 'white'}
              bg={i === index && 'purple'}
              onClick={() => setIndex(i)}
            >
              {name}
            </Heading>
            {
              i === index && <Sublist columns={columns} index={subIndex} onSelect={setSubIndex} />
            }
          </>)
        }
      </Flex>
      <Flex ml={1} pl={3} flex={3.5} sx={{ borderLeft: "3px dashed purple" }}>
        <Template header="Happy">{

          `
The lift coefficient ($C_L$) is a dimensionless coefficient.  
happy is not fun      
~~~haskell
type Env = [String]

comp :: E.Expr -> Env -> Expr
comp (E.CstInt i) _ = CstInt i
comp (E.CstStr i) _ = CstStr i
comp (E.CstBool i) _ = CstBool i
comp (E.Add a b) env = Add (comp a env) (comp b env)
comp (E.Mul a b) env = Mul (comp a env) (comp b env)
comp (E.Let n v scp) env = Let (comp v env) (comp scp $ n:env)
comp (E.Var n) env = case elemIndex n env of 
    Just i  -> Var i
    Nothing -> Err "Undefined variable"
comp (E.Err s) _ = Err s
~~~
          `
        }</Template>
      </Flex>
    </Flex>
  )
}



function Sublist({ columns, onSelect, index }) {
  return (
    <AnimatedFlex
      sx={{ borderLeft: "3px solid purple" }}
      height='100%'
      flexDirection="column"
    >
      {
        columns.map((name, i) =>

          <Heading
            height='32px'
            lineHeight='32px'
            pl={2}
            fontSize={1}
            fontFamily='sans-serif'
            onClick={() => index === i || onSelect(i)}
          >
            {name}
          </Heading>
        )
      }
    </AnimatedFlex>
  )
}