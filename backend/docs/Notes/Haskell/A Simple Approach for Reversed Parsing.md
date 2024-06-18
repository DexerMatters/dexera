## Problem
We may encounter with some problems when we use parsers in Haskell to tackle left-associative operators, where there lies a limitation of parser combinators like below.

When there is an input of curry application like "get a b c", we certainly know it shall be parsed into "(((get a) b) c)". However, the fact is that simple parser combinators can only allow left-to-right parsing, so we are unable to expect that 'c' is parsed firstly and then the expression on the right hand of 'c' and so on. So we can say that the mechanism of parser combinators can hardly parse reversedly. It can only reach 'c' after throwing away things before 'c'.



## Solution
### Requirement
We need a kind of *special combinator* that can simply parse the last item that satisfies the combinator, leaving the state like before with only the last matched item consumed.

So we need:
- Parse the last item that satisfies the combinator
- Keep the previous characters

#### manyTill
We've already got `manyTill p end` in Megaparsec that is roughly equivalent to `many p <* end`. `end` can be what we say as *op* and *rhs*. So we can write `manyTill (satisfy $ const True) end` to parse all the characters until the ending combinator meets.   

If so, however, we will lose the *op* and *rhs* consumed by the ending combinator in the final state. So we can write `manyTill (satisfy $ const True) (lookAhead end)` to avoid `end`'s comsumption.

#### rev1
Then we can write something like:

```haskell
rev1 :: Parser a -> Parser (String, a)
rev1 end =  (,)
    <$> manyTill (satisfy $ const True) (lookAhead end)
    <*> end
```
It can provide us with the characters which we consume in order to reach the ending item and the result of the ending parser.

But it is not enough as want to backtrace the parser's state to leave characters consumed back into the state. Here, with parser state combinators that Megaparsec offers, we find the solution.

### Reversed Parsing

```haskell
rev :: Parser a -> Parser a
rev end = do
    o  <- getOffset
    s' <- manyTill (satisfy $ const True) (lookAhead p)
    r  <- p
    setInput s'
    setOffset o
    return r
```