## 前置知识
- [德布朗指数.md](https://www.dexera.online/s/?path=.%2Fdocs%2FNotes%2FPLT%2F%E5%BE%B7%E5%B8%83%E6%9C%97%E6%8C%87%E6%95%B0.md)
- [Lambda演算.md](https://www.dexera.online/s/?path=.%2Fdocs%2FNotes%2FPLT%2FLambda%E6%BC%94%E7%AE%97.md)
## 实现过程
### 将λ项的三种类型声明出来
```haskell
data Expr = 
    App Expr Expr
  | Lam Expr
  | Var Int
  | Err
  deriving Show
```
### 移位的实现
&emsp;&emsp;借助Haskell的模式匹配，我们可以轻轻松松将数学定义改写为代码：
$$
\begin{split}
\uparrow^i_c(n)&= 
\begin{cases}
n& n<c\\
n+i& n\geq c
\end{cases} \\
\uparrow^i_c(\lambda.t)&=\lambda.(\uparrow^i_{c+1}t) \\
\uparrow^i_c(t_1\:t_2)&=(\uparrow^i_c t_1)\:(\uparrow^i_c t_2)
\end{split}
$$
```haskell
shift :: Int -> Int -> Expr -> Expr
shift c i (Var n) | n < c     = Var n
                  | otherwise = Var (n + i)
shift c i (App t1 t2) = App (shift c i t1) (shift c i t2)
shift c i (Lam t) = Lam $ shift (c + 1) i t
shift _ _ e = e
```
### 替换的实现
$$
\begin{split}

n[m\mapsto m']&= 
\begin{cases}
m'& n=m \\
n& n\neq m
\end{cases} \\
(\lambda.t)[m\mapsto m']&=\lambda.t[m+1\mapsto \uparrow^1_0 m']\\
(t_1\:t_2)[m\mapsto m']&=t_1[m\mapsto m']\:t_2[m\mapsto m']
\end{split}
$$
```haskell
subst :: Int -> Expr -> Expr -> Expr
subst i t (Var n) = if n == i then t else Var n
subst i t (Lam t') = Lam $ subst (i + 1) (shift 0 1 t) t'
subst i t (App t' t'') = App (subst i t t') (subst i t t'')
subst _ _ e = e
```
### 解析的实现
>注：在这里并没有限制必须是封闭的，若改为封闭的解析，加一行`eval (Var _) = Err`即可
$$
(\lambda.t_1)\:t_2 
\to 
\uparrow^{-1}_0
t_1[0\mapsto \uparrow^1_0 t_2]
$$
```haskell
eval :: Expr -> Expr
eval (App t t') = case eval t of
    Lam body -> shift 0 (-1) $ subst 0 (shift 0 1 $ eval t') body
    _        -> App t t'
eval (Lam t) = Lam $ eval t
eval t = t
```
