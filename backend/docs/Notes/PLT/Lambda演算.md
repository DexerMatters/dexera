## 解释
&emsp;&emsp;实际上所谓**λ演算**（Lambda Calculus）之所以是一种演算，是因为它形成了一种推导体系，或者说是一种局部替换变换，然后替换来替换去，最后得到结果。但是实际上这种替换的过程是图灵完备的，所以它是非常强大的。  

&emsp;&emsp;我们实际上可以把一些学过的数学函数看成一种替换。  
&emsp;&emsp;比如$f(x) = x + 1$， $f$是运用在变量$x$上的一种映射关系，对于每一个$x$，都有一个对应的$x+1$作为函数值。而$f(0)$就对应着$0 + 1$也就是1，$f(2)$就对应着$2 + 1$也就是3。不难看出，想要得出函数值，就是将函数式子中的自变量替换成参数值就行了，因此我们其实可以把它改写成**λ项**（Lambda-Term）。
$$
\lambda x.x+1
$$

## 构造规则
&emsp;&emsp;最简单的λ演算只包含三个规则：**变量**（Variable），**抽象**（Abstraction）与**应用**（Application）。他们也会作为三种不同形式的λ项。
  
&emsp;&emsp;它们具有自己的形式化语法。实际上为了便于理解，我们可以结合数学函数的语法来学习。

- 变量：$x$
- 抽象：$\lambda x.M$&emsp;v.s.&emsp;$f(x) = M$
- 应用：$M_\lambda\;N$&emsp;v.s.&emsp;$M_f(N)$

### 抽象（Abstraction）
$$\lambda x.M$$
&emsp;&emsp;我们把这种的声明称作为**抽象**，相当于写出一个$f(x) = x + 1$这样的数学函数，在此，我们抽象和函数是等同的（实际上，在英文中Abstraction和Function都可以翻译作函数，只不过在不同的领域叫法不同）。  
&emsp;&emsp;其中，我们把函数中定义变量的过程叫做**绑定**（Binding），λ叫做**绑定器**（Binder），后面写要绑定（声明）的变量。点符号“.”的前面是绑定的过程，后面的$M$指的是**抽象体**（body），它可以是任意含变量x的λ表达式，相当于函数体$x+1$。  
&emsp;&emsp;在此，我们定义$\Gamma$为**上下文**。每进行一次绑定，实际上都在向$\Gamma$中存储变量名，供后面的抽象体进行查找。即$\lambda x \to \Gamma\cup\{x\}$

### 变量（Abstraction）
$$x$$
&emsp;&emsp;在这里，我们探讨的变量实际上是抽象体中的变量，（因为点符号前面的绑定过程实际上是变量声明过程，它没有运用到变量本身）这种变量也叫做**自由变量**（Free Variable）。  
&emsp;&emsp;当抽象体中的变量在之前都被绑定（没有未声明的变量），那么我们可以说这个表达式是**封闭的**（Closed-Term）; 而当抽象体中存在没有绑定的变量，那么我们可以说这个表达式是非封闭的。在简单λ演算中，我们实际上不希望它是非封闭的，我们要确保表达式所有变量都被绑定，也就是每个变量在他们解析的时候，都必须包含于$\Gamma$中。

### 应用（Application）
$$M_\lambda\;N$$
&emsp;&emsp;这个式子可以读作“将$N$应用到$M_\lambda$”，“$N$是$M_\lambda$的参数”，相当于写出一个$f(2)$类似的式子。  
&emsp;&emsp;当我们把$N$代入到$M_\lambda$后运算出结果的过程叫**解析**（Evaluation，$\to$），上面我们也说过，应用的过程就是替换的过程，相当于我们把$M_\lambda$中的某个变量全部替换成了$N$，因此我们也有以下规定：
- $M_\lambda$ 必须是解析之后为*抽象*的式子，这样它才能被应用参数
- $N$替换$M_\lambda$中某变量需要遵循**替换**的规则


## β规约（β-Reduction）
&emsp;&emsp;$M_\lambda$解析后的抽象中，绑定器绑定的变量将作为即将被替换的变量，对于这个变量出现的后续一切位置都将被$N$所取代，而这个变量的绑定也将被消除，即只剩下解析结果（替换后的抽象体）—— 这个过程我们称作为λ演算中的**β规约**，也就是这种替换的过程。

### 公理化
&emsp;&emsp;我们在此定义$M[x \mapsto S]$表示将$M$中的$x$替换为$S$，并定义如下规则：
$$
\begin{split}
v[x\mapsto S] =&
  \begin{cases}
    S& v = x\\
    v& v \ne x
  \end{cases} \\
(\lambda v.M)[x\mapsto S]=&
  \begin{cases}
    M[x\mapsto S]& v = x\\
    \lambda v.M[x\mapsto S]& v \ne x
  \end{cases} \\
(M_\lambda\;N)[x\mapsto S]=&M_\lambda[x\mapsto S]\:N[x\mapsto S]
\end{split} \\
$$
&emsp;&emsp;上面规则并不难理解：
- 对于自由变量：若自由变量与要替换的变量相同，则将其换掉，否则保留原变量。
- 对于抽象：若绑定变量与要替换的变量相同，则对抽象体表达式进行替换，否则保留原抽象。
- 对于应用则是两式分别使用替换。

### 解析与替换
&emsp;&emsp;有了替换规则，我们能够用替换来表示解析应用的过程：
$$
(\lambda x.M)\:N \to M[x\mapsto N]
$$

### 实例
(1) $\Gamma = \emptyset$
$$
\begin{split}&
(\lambda x.x)\:(\lambda y.y) \\
\to& (\lambda x.x)[x\mapsto \lambda y.y]\\
\to& x[x\mapsto \lambda y.y]x \\
\to& \lambda y.y
\end{split}
$$
(2) $\Gamma = \{s\}$
$$
\begin{split}&
(\lambda x.\lambda y.x\:y)\:(\lambda z.z)\:s \\
\to&(\lambda y.(\lambda z.z)\:y)\:s \\
\to&(\lambda z.z)\:s \\
\to&s
\end{split}
$$

## 更多概念
### 高阶函数
&emsp;&emsp;以函数作为参数的函数称为**高阶函数**（High-Order Function），这在λ表达式中非常常见，例如实例中的`(2)`
### 柯里函数
&emsp;&emsp;我们把函数值（返回值）为函数的函数称为**柯里函数**（Curry Function）。事实上，多元函数均可以柯里化，例如$f(x, y, z) = x^2+y^2+z^2$，
- 我们只传入$x=1$，得到$f_1(y,z) = f(1, y, z) = 1+y^2+z^2$
- 再传入$y=2$得到$f_2(z) = f_1(2,z) = 5+z^2$
- 再传入$z=3$得到$f_2(3) = 14$  

&emsp;&emsp;再例如：$\lambda x.\lambda y.\lambda z.M \overset {传入x}\to \lambda y.\lambda z.M_1 \overset {传入y}\to\lambda z.M_2\overset {传入z}\to M_3$ ——这种一步步传值，一步步推导的过程就是β规约的过程，当推导到无法推导的地步，得到的值称之为**底值**（Ground Value），例如如果$M_3$无法再进一步推导，那么它就是一个底值。我们通过$f(x, y, z)$一步步传参推导出的14，就是一个底值。
>&emsp;&emsp;实际上，在纯粹封闭的λ推演中，底值只可能是抽象。因为在构造规则中，我们的λ项种类只有变量，抽象与应用。如果变量作为底值那就代表它没有被替换，即未绑定，这与封闭性矛盾; 如果应用作为低值，那么它就可以进一步推导——因此只有抽象才能作为底值。
