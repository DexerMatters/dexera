*德布鲁因？我还是直接用英文吧*
## de Bruijn Index
>在数学逻辑中，de Bruijn index 是由荷兰数学家尼古拉斯·戈弗特·德布鲁因发明的一种工具，用于表示λ演算中的项，而无需命名绑定变量。使用这些indices书写的项对于α-变换是保持不变的，因此α-等价的检查与语法等价的检查是相同的。每个de Bruijn index是一个自然数，表示λ表达式中某个变量的出现，并表示从该出现到其对应绑定之间的绑定数量。  --Wiki  

&emsp;&emsp;在实际开发中，实现λ演算时会产生很多自由变量，往往会以一个名字来绑定，例如$\lambda fx.f\:x$，我们将$\lambda fx$称为**绑定器**(Binder)。而de Bruijn Index的作用是将这种显式绑定隐式化，并用从0开始的整数对每个变量进行绑定，而非以名字，所以上式也可以改写为$\lambda.\lambda.1\:0$
### 从标准表达式到de Brujin表达式
&emsp;&emsp;对于标准表达式$\lambda fx.f\:x$，我们可以用以下方式转换为de Brujin表达式
$$
\begin{split}
&\lambda fx.f\:x          \\
\overset{Expand}\Longrightarrow
&\lambda f.\lambda x.f\:x \\
\overset{Indexed}\Longrightarrow
&\lambda f^{\color{green}1}.\lambda x^{\color{blue}0}.f\:x    \\
\overset{Replace}\Longrightarrow
&\color{green}\lambda.\color{blue}\lambda.\color{green}1\:\color{blue}0
\end{split}
$$  
&emsp;&emsp;不难看出，我们首先把  
&emsp;&emsp;这里也有更多的实例λ表达式展开，然后将每个Binder捆绑的变量从右向坐进行编号，$f \to 1\;x \to 0$，接着将式子中的自由变量用这些编号替换，略去变量名后，便得到最终结果，我们也将这种编号映射关系记作上下文（Context）$Γ$


| 标准 | de Bruijn |
|---|---|
| $\lambda x.x$ | $\lambda.0$ |
| $\lambda z.z$ | $\lambda.0$ |
| $\lambda x.\lambda y.x$ | $\lambda.\lambda.1$ |
| $\lambda x.\lambda y.\lambda s.\lambda z.x\:s(y\:s\:z)$ | $\lambda.\lambda.\lambda.\lambda.3\:1(2\:1\:0)$ |

## 移位（shift）
&emsp;&emsp;试想这种情况，我们有一个函数$F=\lambda.\lambda.1$，而它处于外围函数的上下文中（例如$G=\lambda.\lambda.F$），在全局中，有自由变量$0 \in \Gamma;1 \in \Gamma \Rightarrow 0\:1 \in \Gamma$，那么我们将$0\:1$应用到$F$，即把$F$里面第一个$\lambda$捆绑的自由变量$1$进行**替换**（Substitute）。如果仅仅以标准表达式的替换方法，我们将得到$\lambda.\lambda.0\:1$，而实际上在$F$中0和1是其自身绑定的变量，替换的0和1是$F$之外的上下文，这样的替换明显是错误的，为了关联$F$之外由$\lambda$绑定的自由变量，正确的替换结果应该是$\lambda.\lambda.2\:3$。  
&emsp;&emsp;这样我们就需要定义**移位**(Shift)来帮助我们实现：
$$
\begin{split}
\uparrow^i_c(n)&= 
\begin{cases}
n& \text{if}\:n<c\\
n+i& \text{otherwise}
\end{cases} \\
\uparrow^i_c(\lambda.t)&=\lambda.(\uparrow^i_{c+1}t) \\
\uparrow^i_c(t_1\:t_2)&=(\uparrow^i_c t_1)\:(\uparrow^i_c t_2)
\end{split}
$$
&emsp;&emsp;其中$t$是表达式，要么是λ-term。，要么是自由变量; $\uparrow^i_c$具有两个参数，描述向上移$i$位，而$c$充当一个下界的效果，这样就保证了替换函数中某变量时，其他自由变量不会被移位。而有了移位的定义，现在我们可以定义出一个正确的替换：

$$
\begin{split}
n[m\mapsto m']&= 
\begin{cases}
m'& n=m \\
n& n\neq m
\end{cases} \\
(\lambda.t)[m\mapsto m']&=\lambda.t[(\uparrow^1_0 m\mapsto m'+1)]\\
(t_1\:t_2)[m\mapsto m']&=t_1[m\mapsto m']\:t_2[m\mapsto m']
\end{split}
$$
