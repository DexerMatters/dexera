## 给Lambda演算加点语法糖
&emsp;&emsp;在一个中间表示层中，我们会把几乎所有的派生语法（语法糖）用Typed Lambda表达式来进行表示。我们可以把例如`let ... in ...`等功能全用其进行表示。

### 单位类型
&emsp;&emsp;单位类型是一种**单例**（singleton）类型，也就是仅仅存在一种字面量的值，同时也是一种基础类型，类似于布尔值，整型这类类型。它在实际开发中主要以一个占位作用，或者作为一种次要的类型推断结果，在接下来解析中被忽略。这里我们来定义单位类型的相关规则。
- 仅存在一种表示形式`()`（term）
- 仅存在一个值`unit`（value）
$$
\begin{split}
&\text{Syntactic:} \\
terms &::=() \\
values &::=unit \\
type&::=Unit \\
&\text{Typing:} \\
\Gamma \vdash unit &: Unit
\end{split}
$$

### 序列
&emsp;&emsp;序列是一种分号隔开的语法结构$t_1;t_2$，在几乎一切编程语言中我们都能看到它的影子。在ML语言中，这种语法会对$t_1$和$t_2$均解析，但是会省略前者的解析结果（包括类型），返回后者的解析结果（包括类型）   
&emsp;&emsp;接下来我们为这个新语法增加解析规则：
$$
{t_1 \to t_1'}
\over
{t_1;t_2 \to t_1';t_2}
$$
&emsp;&emsp;当$t_1$最后解析为unit时，直接得到后续结果：
$$
{unit:t_2 \to t_2}
$$
&emsp;&emsp;而在类型推断时候，我们需要前者类型是Unit，整个表达式类型应与后者保持一致：
$$
{\Gamma \vdash t_1 : Unit \quad \Gamma \vdash t_2 : T}
\over
{\Gamma \vdash t_1;t_2 : T}
$$
&emsp;&emsp;另一种基于Lambda运算的实现方法需要用到**通配绑定**（Wildcard Binding），即我们可以把$t_1;t_2$抽象成$\lambda x:Unit.t_2 \; t_1$，其中$t_2$中不含$x$这个自由变量，所以当表达式被应用$t_1$时不会进行替换操作，直接会得到$t_2$。这种对Lambda表达式的结果没有作用的绑定形式就是通配绑定，记作$\lambda\_$。所以$t_1;t_2$等价于$\lambda\_:Unit.t_2 \; t_1$  
&emsp;&emsp;这种忽略参数的Lambda次要绑定在很多场合都有应用。

TOC