## Introduction
A distinct difference between System F and dependently typed lambda calculus is the relationship between values and types. In simple typed system, they are separated and evaluated respectively. In dependently typed system, decision of a type can depend on a value. For example, the return type of a dependent function depends on values applied. And in a dependent pair, the type of the second value depends on the first value.

For instance, we can write something like:
```python
n: {n: Integer | n mod 2 == 0}
```
Then `n` is bound with a dependent type `{n: Integer | n mod 2 == 0}` which restricts values of the type an even integer. Additionally, in my notes about meta programming in C++, it is possible to write dependent funtions in C++ with the assistance of values in templates.

## Definition
We first define $\mathcal{U}$ as the universe of types, in which $T$ is defined written as $T:\mathcal{U}$. For any value $\alpha$ typed in $T$, there exist a type $S^\alpha$ which assigns to each $\alpha$. In another word. $S^\alpha$ is derived from and varies with $\alpha$.

### Universe
In homotopy type theory, every type has a type. When we write something like $A:B; B:C; C:A$, every type mentioned is a member of itself, which brings about self-reference and makes it never halt to a result when evaluating ascriptions. To avoid the Russell paradox we introduce a hierarchy of universes $\mathcal{U}_0, \mathcal{U}_1,...,\mathcal{U}_\infty$.
#### Cummulativity
We define $\mathcal{U}_i : \mathcal{U}_j$ when $i \leq j$. Then each universe is a member of the next universe $\mathcal{U}_0: \mathcal{U}_1:...:\mathcal{U}_\infty$.   
There is a trick avoiding explicit indexes in denotation of universe which is to write $\mathcal{U}$ for any $\mathcal{U_n}$. So $A:\mathcal{U}$ means $A$ is in a certain universe hierarchy and $\mathcal{U} : \mathcal{U}$ means $\mathcal{U}_i : \mathcal{U}_j\; when \;i \leq j$

>For more reasons why universes are introduced:
>https://ncatlab.org/nlab/show/type+universe

### Π type
Π types are also called dependent functions, whose return type varies with its argument. It can be written as

$$\Pi(x:T)S^x:\mathcal{U}$$

They are functions that require a value and return the type that depends on the value, and also programs that calculate types from values. $S$ is a *type family*. Hence equality between Π types is a core evaluation in type checking, which may contain running programs unlike other type checkers.

### Constant Π type
When $S$ does not depend on the value $x$ then it is a constant dependent function written as $\Pi(x:T)S$. More simplifed can be $T \to S$

### Σ type
Σ type are also called dependent pair type, the type of whose second value depends on its first value. It can be written as

$$\Sigma(x:T)S^x:\mathcal{U}$$

$(a, b):\Sigma(x:T)S^x$ is a dependent pair typed with $(a:T, b:S^a)$.


## Normalization