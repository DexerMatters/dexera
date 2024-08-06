## 1 Introduction
*Path* is a novel approach and extension to some polymorphic system, which is also a feature drawn by languages like Scala. The main feature it brings is upper-limited subtype polymorphic in dependently typed system. We can easily describe type hierarchies through the polymorphism and encode System F<:> with its dependency. Path dependency concretizes and makes intuition of the dependent system into a more productive and easy-to-use constraint system.
### 1.1 From Type Dependency to Path dependency
In type dependency, we introduce universes to properly elaborate the type of a type and make bridges between types and infinite sets. In the latter we can compare paths to finite sets. We define lower and upper limits of a type in purpose of elaborating relations between two types. We can only allow conversion between two evaluatively identical types in dependent typing, while a more specific definition of a type's *boundary* loosens the conversion and brings subtyping polymorphism.

In terminology, we don't say T is the type of A. Instead, we consider A as some type *between* type M and type N. And the path formed with M and N is its type.

$$A:T \to A:\{M...N\}$$

In polymorphism, the left term can also be presented as $\forall A.M:>A<:N$ where $A$ is a bound type variable that satisfies it is the supertype of $M$ and subtype of $N$. In another word, $A$ is exactly typed with a path type $\{M...N\}$

### 1.2 Bottom and Top
Beside path types, we also define types $\top$ and $\bot$ for full polymorphism. $\top$ (Top) is the supertype of all types while $\bot$ (Bot) is the subtype of all types. That is, for all types, they are defined between $\top$ and $\bot$. Therefore there is a correspondence between $\mathcal{U}$ and $\{\bot ... \top\}$, from which every type is originated.

## 2 Implementation
Implementation of path dependency shares a majority of mechanism used in dependent types, so there could be a better reading experience with prerequisite knowledge of implementation in dependent types.

### 2.1 Core Syntax
$$
\begin{align*}

t,\rho,x=&\top &&\text{Top}\\
    &\bot &&\text{Bot}\\
    &\{\rho...\rho'\} &&\text{Path Type}\\
    &x &&\text{Variable}\\
    &\lambda x.t &&\text{Abstraction}\\
    &\Pi x:\rho \to \rho &&\text{Pi Type}\\ 
    &let\:x:\rho=t\:in\:t' &&\text{Let-Expression}\\
    &typeof\:t &&\text{Type of Term}\\

\end{align*}
$$

We continue the view about *everything is terms* and annotate $\rho$ as type terms (terms that serve as types in the context). We will de-nominalize every bound variable to de Bruijn indices. And we will also divide terms into *raw terms*, *uninterpreted terms* and *value terms*. The benefit of term separation is not only desugaring and indexing, but a reminder for us to tell apart terms in different sections in order to avoid repetitive interpreting on some term.

```haskell

module Raw where


type Name = String

type Ty = Tm

data Tm                   -- t,T
  = Var Name              -- x
  | Lam Name Tm           -- \x.t
  | App Tm Tm             -- t t'
  | Let Name Ty Tm Tm     -- let x::T = t in t'
  
  | Cast Ty Tm            -- [T]t
  | Top                   -- Top
  | Bot                   -- Bot
  | Cons Ty Ty            -- {T ... T'}
  | Uni                   -- {U}
  | Pi Name Ty Ty         -- x:T -> T'
  | TypeOf Tm             -- typeof t
  deriving (Show)
```
**Raw terms** are the direct product of the AST parser that has variable names and some syntax sugars. You can notice that casting is introduced in raw terms as well as Universe. Univese is a short-hand for a fully polymorphic path.

```haskell
module Term where
import Raw (Name)


type Ix = Int

type Ty = Tm

data Tm                   -- t
  = Var Ix                -- x
  | Lam Name Tm           -- \x.t
  | App Tm Tm             -- t t'
  | Let Name Ty Tm Tm     -- let x::T = t ; t'

  | TypeOf Ix
  | Top                   -- TOP
  | Bot                   -- BOT
  | Cons Ty Ty            -- {T ... T'}
  | Pi Name Ty Ty         -- (x:T) -> T'

  deriving (Show)
  ```
  **Uninterpreted terms** are results of the type elaborator that indexes variables and cleans sugars. *Uninterpreted* means they are not evaluated, which is crucial for implementation of closures because for a function its body is insufficient with attendence of unknown variables untill it is applied with parameters.


```haskell

module Value where
import Raw (Name)
import Term (Tm, Ix)


type Env = [Val]

data Closure = Closure Env Tm  deriving (Show)

data Val                    -- t
  = Var Ix                  -- x
  | Lam Name Closure        -- \x.t
  | Top                     -- Top
  | Bot                     -- Bot
  | Cons Val Val            -- {T ... T'}
  | Pi Name Val Closure     -- x:T -> T'
 deriving (Show)

```
**Value terms** are results of the evaluator. They are the final results of a program. We use closures to store uninterpreted terms when unable to evaluate (meet functions). Let-expression is omitted because its value exactly depends on its scoped term with a known variable it defines.  

```haskell
import qualified Value as V (Val(..)) 
import qualified Term as T (Tm(..)) 
```

Then we qualified module everywhere we wish to import them.

### 2.2 Evaluation
$$
\begin{align*}
\Gamma&= \varnothing\:|\:\langle i,v \rangle &&\text{Value Enviroment}\\
H&=(\Gamma,t)&&\text{Closure}\\
v&=\top\:|\:\bot\:|\:i\:|\:\lambda.H\:|\:\{v...v\}\:|\:\Pi:v \to H &&\text{Value}\\
t&=... &&\text{Unintepreted Terms}
\end{align*}
$$
An evaluator outputs `Val` from `T.Tm`. First we define that a value enviroment is an indexed list and that a closure is a structure that store envs and unintepreted terms.

For concern on space and readablilty, we provide partial codes in every section presented as case branches:
```haskell
eval :: Env -> Tm -> Val
eval env = \case ...
```
> In the program, we preserve names of bound variables in lambda abstraction and Pi types in convenience for reading-back section after evaluation (which won't mention in this paper)

#### 2.2.1 Invariants
$$
\over
\top \Downarrow \top \qquad \bot \Downarrow \bot
$$
```haskell
T.Bot -> V.Bot
T.Top -> V.Top
```

#### 2.2.1 Path
$$
\Gamma \vdash t \Downarrow v \qquad \Gamma \vdash t' \Downarrow v'
\over
\Gamma \vdash \{t...t'\} \Downarrow \{v...v'\}
$$

```haskell
T.Cons ty ty' 
    -> V.Cons (eval env ty) (eval env ty')
```

#### 2.2.2 Variable
$$
\Gamma \ni \langle i,v \rangle
\over
\Gamma \vdash i \Downarrow v
$$
```haskell
T.Var x -> env !! x
```

#### 2.2.3 Lambda Abstraction
$$
H = (\Gamma, t)
\over
\Gamma \vdash \lambda.t \Downarrow \lambda.H
$$
```haskell
T.Lam n body
    -> V.Lam n (Closure env body)
```