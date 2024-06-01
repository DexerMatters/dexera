## 概述
> In computer programming, a parser combinator is a higher-order function that accepts several parsers as input and returns a new parser as its output. In this context, a parser is a function accepting strings as input and returning some structure as output, typically a parse tree or a set of indices representing locations in the string where parsing stopped successfully. Parser combinators enable a recursive descent parsing strategy that facilitates modular piecewise construction and testing. This parsing technique is called combinatory parsing —— Wiki  

在一般的Parser模型中，一般会有可变的介入，也就是`next`的实现依托于迭代器的变化，而在变量不可变的Haskell中，一般会使用Parser组合子来实现对语句的Parsing


Highlight test:
```haskell
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
```