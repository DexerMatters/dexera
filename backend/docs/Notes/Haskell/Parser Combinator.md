## 概述
> In computer programming, a parser combinator is a higher-order function that accepts several parsers as input and returns a new parser as its output. In this context, a parser is a function accepting strings as input and returning some structure as output, typically a parse tree or a set of indices representing locations in the string where parsing stopped successfully. Parser combinators enable a recursive descent parsing strategy that facilitates modular piecewise construction and testing. This parsing technique is called combinatory parsing —— Wiki  

&emsp;&emsp;在一般的Parser模型中，一般会有可变的介入，也就是`next`的实现依托于迭代器的变化，而在变量不可变的Haskell中，一般会使用Parser组合子来实现对语句的Parsing。在Parser组合子中，每一个Parser都可以是多个Parser的相加，类似于数组`[1,2,3]`相当于`[1]`与`[2,3]`的相加，满足半群性质。

&emsp;&emsp;首先会将自然语言的字符串作为输入，每经过一个Parser都会对输入的字符串进行消耗，并以消耗的字符/字符串为基础返回Parse的结果，并将此Parser的剩余字符串传递给下一个Parser。



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