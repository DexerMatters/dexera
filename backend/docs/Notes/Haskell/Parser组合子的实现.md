## 概述
> 在计算机编程中，parser组合子是一种高阶函数，它接受多个 parser 作为输入并返回一个新的 parser 作为输出。在这个上下文中，parser 是一个接受字符串作为输入并返回某种结构作为输出的函数，通常是一个解析树或一组表示解析成功停止位置的索引。Parser组合子使递归下降解析策略成为可能，从而促进模块化的分段构建和测试。这种解析技术称为 combinatory parsing。 —— Wiki  

&emsp;&emsp;在一般的Parser模型中，一般会有可变的介入，也就是`next`的实现依托于迭代器的变化，而在变量不可变的Haskell中，一般会使用Parser组合子来实现对语句的Parsing。在Parser组合子中，每一个Parser都可以是多个Parser的相加，类似于数组`[1,2,3]`相当于`[1]`与`[2,3]`的相加，满足半群性质。

## 原理
&emsp;&emsp;每个Parser组合子首先会将自然语言的字符串作为输入，每经过一个Parser都会对输入的字符串进行消耗，并以消耗的字符/字符串为基础返回Parse的结果，并将此Parser作为下一个Parser的参数进行传递。



```plantuml
!theme plain

hide empty description

state StringParser {
  state "SatisfyParser" as C1 : Hello World" 1234
  state "CharParser" as C2 : ello World" 1234
  state "CharParser" as C3 : llo World" 1234
  state "..." as More
  state "SatisfyParser" as C4 : 1234
  state "Consume" as Cms1 : character \"
  state "Consume" as Cms2 : character \"
  state Record {
    state "..." as More1
    state "Hello World" as Res
    H -> He
    He -> More1
    More1 -> Res
  }
  C1 -> C2
  C2 -> C3
  C3 -> More
  More -> C4

  C1 --[dotted]> Cms1
  C2 --[dotted]> H
  C3 --[dotted]> He
  C4 --[dotted]> Cms2
}
state AST: type: TermStr\nvalue: "Hello World"

LastParser --> C1: "Hello World" 1234
C4 -> NextParser : 1234
LastParser: ...
NextParser: ...
Res --> AST

note top of C1: 取出输入字符串的第一个字符\n当它满足为\\"后继续
note top of C2: 记录输入字符串的第一个字符\n当它满足不为\\"后继续

```

### Monadify
&emsp;&emsp;在使用Haskell完成Parser组合子的过程中，经常会将Parser封装为**状态单子**（State Monad）进行演算，其好处是：
- 其将每个Parser记录的字符串作为当前的*状态*，从而实现其的传递与更新。每经过一个Parser都可能使得状态更新。
- 当其实现`Alternative`（或者`MonadPlus`）后允许其使用连接符进行叠加，使用`some`或`many`进行重复匹配，从而产生更丰富的Parser。
- 单子的设计理念刚好符合Parser组合子的性质：*将Parser作为下一个Parser的参数进行传递*
- 每个Parser的创造可以使用`do`语法糖，以及各种单子运算符
- 单子在异常处理中有优势。

## 实现
### 准备
&emsp;&emsp;然后我们要明确我们要写什么：
- 一个新的Parser类型，它后续作为一种*状态单子*，应该以一个函数作为构造
- 规范一种空Parser的类型，也规范一套异常类型
- 陆续实现`Applicative`，`Monad`与`Alternative`
- 写出最基础的Parser（检测头字符是否满足要求）
- 写出各种各样的基础Parser
- 最后实现能够以AST为输出的parser
### newtype Parser
```haskell
newtype Parser r =  
  Parser  { runParser ::  String ->  Either [Error] (r, String) }
  deriving Functor
```
&emsp;&emsp;在这段代码中，我们把`String`作为一种全局状态，每一次Parse将会造成两种不同的结果，要么是`[Error]`作为错误，例如`Unexpected character xxx`; 要么返回parse的结果`r`并传递下一个状态。当然`Functor`是能够直接使用`deriving`实现的。

### data Error
```haskell
data Error =
    EndOfInput
  | Unexpected Char
  | Expected Char Char
  | None
  deriving (Eq, Show)
```
&emsp;&emsp;这段中我们把`Error`给规范了一下：
- **EndOfInput** 当某Parser在解析过程中，还未产生结果，输入字符串已经空了
- **Unexpected Char** 当Parser解析到一个无法匹配的字符
- **Expected Char Char** 当Parser解析到一个不符合预期字符的字符，相当于"Expected a, got b"
- **None** 没有错误，接下来我们会用`[None]`表示空Parser

### instance Monad
```haskell
instance Applicative Parser where
  pure a = Parser $ \input -> Right (a, input)
  Parser p <*> Parser q = Parser $ \input -> do
    (f, rest)  <- p input --将输入字符串给Parser p，产生解析结果与余下字符串
    (a, rest') <- q rest --将余下字符串给Parser q，产生解析结果与余下字符串
    return (f a, rest')

instance Monad Parser where
  return = pure
  Parser p >>= f = Parser $ \input -> do
    (a, rest) <- p input
    runParser (f a) rest
```
&emsp;&emsp;在此由于`Either`实现了单子，所以我们可以使用`do`语法糖来简化我们的代码，而且也增加了可读性。

### instance Alternative
```haskell
empty = Parser $ \_ _ -> Left [None]
  Parser l <|> Parser r = Parser $ \input ->
    case l input of
      Right (a, rest) -> Right (a, rest)
      Left err ->
        case r input of
          Right (a', rest') -> Right (a', rest')
          Left err'         -> Left $ nub (err ++ err')
```
&emsp;&emsp;根据`Alternative`的定义，我们规定在组合子的`<|>`运算中，运算结果为左右两Parser中有效（`Right`）的那一个，若均有效则取左值，若均无效则会把错误信息进行去重叠加（`nub (err ++ err')`）。而实现了`Alternative`的这些成员后，some与many也会同时实现，这样我们实现了Parser的重复循环匹配。

### 基础的Parser
&emsp;&emsp;首先我们希望存在一种Parser可以将输入的头字符消耗掉，而且对这个字符进行条件匹配，若满足条件则输出那个头字符，若不满足则报错。所以我们可以这样定义satisfy:
```haskell
satisfy :: (Char -> Bool) -> (Char -> Error) -> Parser Char
satisfy p err = Parser $ \input -> case input of 
  "" -> Left [EndOfInput]
  hd:rest | p hd      -> Right (hd, rest)
          | otherwise -> Left [err hd]
```
&emsp;&emsp;在这个定义中，我们把条件函数`p`与报错类型`err`作为参数，得到的就是我们需要的Parser。（其中，`err`是作为`Char -> Error`类型的函数传进去，这是便于产生错误的头字符能够与这个函数集合，进而产生错误，例如`err`传`Unexpected`时，`err hd`就构造出一个`Error`类型，值为`Unexpected hd`; 传`Expected x`时，`err hd`的值就会是`Expected x hd`）
）
  

&emsp;&emsp;接着我们可以定义一个函数，能够返回匹配某个字符的的Parser。根据之前定义的`satisfy`，这个函数可以很容易被定义下来：
```haskell
char :: Char -> Parser Char
char c = satisfy (== c) (Expected c)
```
  
&emsp;&emsp;有了匹配单个字符的功能后，我们再添加匹配字符串：
```haskell
string :: String -> Parser String
string [] = return []
string (c:cs) = do
  hd   <- char c
  rest <- string cs
  return (hd:rest)
```
&emsp;&emsp;这里为了简化我们的代码，再次使用了`do`语段，并使用了一个递归来不断读取头字符进行判断。（在这个地方，我们不会采用`many`或者`some`，因为它们产生的都是相同的Parser,而我们在匹配字符串中，每个匹配头字符的Parser是不同的）
  
&emsp;&emsp;然后就是在解析自然语言中必不可少的跳过空白字符
```haskell
space :: Parser String
space = many $ satisfy isSpace $ const None

token :: Parser a -> Parser a
token p = space >> p
```

&emsp;&emsp;在这里我们会使用`many`来产生一系列Parser,从而匹配消耗一个或多个空白字符，即使匹配失败，这里也不会产生错误（`const None`相当于`\_ -> None`）  
&emsp;&emsp;然后将`space`和其他Parser的结合封装成了`token`，省略某Parser之前的空格，便于后续编写返回Token的Parser（每个表达式往往前面有空格，而且也往往以空格隔开）
  
&emsp;&emsp;接下来我们会定义一系列Parser，输出Token，来服务于AST的构建


### 解析字符串
```haskell
parseString :: Parser Token
parseString = token $ do
  _   <- char '\"'
  str <- many $ satisfy (/= '\"') (const None)
  _   <- char '\"'
  return $ TermStr str
```
### 解析数字
```haskell
parseInteger :: Parser Token
parseInteger = token $ do
  str <- some $ satisfy isDigit Unexpected
  return $ TermNum $ read str
```

### 解析布尔值
```haskell
parseBool :: Parser Token
parseBool = token $ do
  b <- string "true" <|> string "false"
  return $ TermBool (b == "true")
```

### 解析表达式
```haskell
parseExp :: Parser Token
parseExp =
      parseString
  <|> parseInteger
  <|> parseBool
  <|> ...
```
&emsp;&emsp;这样，任何表达式都可以被我们的Parser组合子解析

> 如何执行Parser呢？我们可以定义以下函数帮助我们测试执行：
> ```haskell
> parse :: Parser r -> String -> Either [Error] (r, String)
> parse p input = runParser p input
> ```

## 改进
&emsp;&emsp;我们往往会看到这种语言报错
> 13:2 error Parsing error: Unexpected character 'x'

&emsp;&emsp;这里我们也发现了，为了更好的描述哪里出了问题，一个报错往往还需要有Error发生的位置，如这里的`13:2`，这代表我们也需要将**位置**作为一种全局状态，而不仅仅是字符串，那么我们需要在Parser的定义做出改动：
```haskell
type Pos = (Int, Int)

newtype Parser r =  
  Parser  { runParser ::  String -> Pos ->  Either [Error] (r, Pos, String) }
  deriving Functor
```
&emsp;&emsp;这样我们将位置也作为全局状态了，不过加入了新的状态参数就意味着各种各样类型类的实现都需要改写，在这里就直接呈现代码，不繁复说明了：
```haskell
instance Applicative Parser where
  pure a = Parser $ \input pos -> Right (a, pos, input)
  Parser p <*> Parser q = Parser $ \input pos -> do
    (f, pos', rest)  <- p input pos
    (a, pos'', rest') <- q rest pos'
    return (f a, pos'', rest')

instance Monad Parser where
  return = pure
  Parser p >>= f = Parser $ \input pos -> do
    (a, pos', rest) <- p input pos
    runParser (f a) rest pos'
  
instance Alternative Parser where
  empty = Parser $ \_ _ -> Left [None]
  Parser l <|> Parser r = Parser $ \input pos ->
    case l input pos of
      Right (a, pos', rest) -> Right (a, pos', rest)
      Left err ->
        case r input pos of
          Right (a', pos'', rest') -> Right (a', pos'', rest')
          Left err'                -> Left $ nub (err ++ err')
```
&emsp;&emsp;我们知道，每经过一个字符`Pos`的列坐标会增加，每经过一行（'\n'）`Pos`的行坐标会增加。所以我们需要修改一下`satisfy`，让它能够在每次经过一个字符时对坐标状态进行修改。
```haskell
--这里为了简便两项元组对某项的增加，新定义了两种succ
succ1 :: Num a => (a, b) -> (a, b)
succ1 (a, b) = (a + 1, b)
succ2 :: (Num b, Num a) => (a, b) -> (a, b)
succ2 (a, b) = (a, b + 1)

satisfy :: (Char -> Bool) -> (Char -> Error) -> Parser Char
satisfy p err = Parser $ \input pos -> case input of 
  "" -> Left [EndOfInput]
  hd:rest | p hd      -> 
            if hd == '\n' then Right (hd, succ1 pos, rest)
                          else Right (hd, succ2 pos, rest)
          | otherwise -> Left [err hd]
```
&emsp;&emsp;至此，我们实现了在解析过程中对于解析位置的记录，而至于对于错误信息的Pretty Print就留给读者自己来实现了！