## Problem
We may encounter with some problems when we use parsers in Haskell to tackle left-associative operators, where there lies a limitation of parser combinators like below.

When there is an input of curry application like "get a b c", we certainly know it shall be parsed into "(((get a) b) c)". However, the fact is that simple parser combinators can only allow left-to-right parsing, so we are unable to expect that 'c' is parsed firstly and then the expression on the right hand of 'c' and so on. So we can say that the mechanism of parser combinators can hardly parse reversedly. It can only reach 'c' after throwing away things before 'c'.



## Solution
### Requirement
We need a kind of *special combinator* that can simply parse the last item that satisfies the combinator, leaving the state like before with only the last matched item consumed.

So we need:
- Parse the last item that satisfies the combinator
- Keep the previous characters

#### manyTillEnd
We've already got `manyTill p end` in Parsec that consumes the input by with `p` untill `end` and returns the result of the consumption. `end` can be what we say as *op* and *rhs*. So we can write `manyTill anySingle end` to parse all the characters until the ending combinator meets.

If so, however, we will lose the *op* and *rhs* consumed by the ending combinator in the final state. So we can write `manyTill anySingle (lookAhead end)` to avoid `end`'s consumption. So we can redefine `manyTill` to the case we want.

```haskell
manyTillEnd :: Parser a -> Parser String
manyTillEnd p =
        try (do {_ <- lookAhead (p *> eof); return []})
    <|> (do {x <- anySingle; xs <- endWith p; return (x:xs)})
```
We write a `try` before the first do-term because we need the process can recover from the fail and be evaluated by the next case, and also an `eof` to ensure the ending combinator exactly match the string at the end of the input.

#### rev1
Then we can write something like:

```haskell
rev1 :: Parser a -> Parser (String, a)
rev1 p =  (,)
    <$> manyTillEnd p
    <*> p
```
It can provide us with the characters which we consume in order to reach the ending item and the result of the ending parser.

But it is not enough as want to backtrace the parser's state to leave characters consumed back into the state. Here, with parser state combinators that Megaparsec offers, we find the solution.

### Reversed Parsing

```haskell
rev :: Parser a -> Parser a
rev p = do
    o  <- getOffset
    s' <- manyTillEnd p
    r  <- p
    setInput s'
    setOffset o
    return r
```

## Example
### Lexing apply-term
tbc