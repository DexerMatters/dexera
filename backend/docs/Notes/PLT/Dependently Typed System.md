## Introduction
A distinct difference between System F and dependently typed lambda calculus is the relationship between values and types. In simple typed system, they are separated and evaluated respectively. In dependently typed system, decision of a type can depend on a value. For example, the return type of a dependent function depends on values applied. And in a dependent pair, the type of the second value depends on the first value.

For instance, we can write something like:
```python
n: {n: Integer | n mod 2 == 0}
```
Then `n` is bound with a dependent type `{n: Integer | n mod 2 == 0}` which restricts values of the type an even integer. Additionally, in my notes about meta programming in C++, it is possible to write dependent funtions in C++ with the assistance of values in templates.

## Definition
We first define $\mathcal{U}$ as the universe of types, in which $T$ is defined written as $T:\mathcal{U}$. For any value $\alpha$ typed in $T$, there exist a type $S^\alpha$ which assigns to each $\alpha$. In another word. $S^\alpha$ is derived from and varies along $\alpha$.

### Π type
Π types are also called dependent functions, whose return type varies with its argument. It can be written as

$$\Pi(x:T)S^x$$

They are functions that require a value and return the type that depends on the value, and also programs that calculate types from values. Hence equality between Π types is a core evaluation in type checking, which may contain running programs unlike other type checkers.

### Σ type
Σ type are also called dependent pair type, the type of whose second value depends on its first value. It can be written as

$$\Sigma(x:T)S^x$$

$(a, b):\Sigma(x:T)S^x$ is a dependent pair typed with $(a:T, b:S^a)$.