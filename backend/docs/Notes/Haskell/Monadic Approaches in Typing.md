## General
State Monad is a significant structure made to constitute states in a context-free and immutable development enviroment. When we write a type checker, there can be a lot of terms able to be simplified to State Monad functions in order to store some context/enviroment infomation.Furthermore the state monad can make effects throughout the evaluation, make a global enviroment and do great benefits to the beautification of your programming.

## Approach

### ExceptT
There can be a lot of exceptions expected when terms get evaluated. Then we can use `ExceptT` to provide State Monads with exception.
```haskell
newtype ExceptT e m a
```
`e` is for the type of exceptions or errors (left hand of `Either`); `m` for the inner monad; `a` is for the successful result (right hand of `Either`).
```haskell
runExceptT :: ExceptT e m a -> m (Either e a)
```
We can apply this to make the inner monad exposed to the surface then we get an `Either` as the result of evaluation. Pretty!

Then we can replace `s` with the state we expect.

### Splitting Lists in a State
We can define a State like this:
```haskell
data EvalEnv = EvalEnv {
    binders  :: [(String, Ty)]
}

State ([t], [t], EvalEnv)
```
We put two `[t]`s as the state, where the first one is *what we process, check and evaluate* and the second one is *what has left after being processed*. And then we can put our binder record into the second element. (Also you can write even more elements in `EvalEnv` as we may have more enviroments in evaluation process)

> For a ML language. The instance of splitting lists is faster than an integral iterator in one by one iterating. So we don't use `([t], Int, EvalEnv)` as the state

### EvalState
```haskell
data EvalError = 
      UndefinedType     FI Ty
    | BadTyped          FI Ty Ty
    | UnboundVariable   FI String
    | UndefinedBehavior FI
    | EndOfEval
    deriving Show

data EvalEnv = EvalEnv {
    binders  :: [(String, Ty)]
}

type EvalState t = ExceptT [EvalError] (State ([t], [t], EvalEnv))
```
> Perhaps you may be confused with making `EvalError` a list. The error that occurs should be exactly one, isn't it? The reason is that we purify the `EvalError` to instance `Monoid`. Therefore we can apply some alternative combinators such as `many` and `<|>` to `EvalState` for some further needs.

`t` is for the element type of the AST; `FI` for file infomation; `Ty` for types

### Implementations
```haskell
-- Return the head term
check :: EvalState t t
check = lift get >>= \case 
    (hd:_, _, _) -> return hd 
    _ -> throwError [EndOfEval]

-- Return the head term, then stored into the second list
next :: EvalState t t
next = lift get >>= \case 
    (a:as, bs, e) -> put (as, a:bs, e) >> return a
    _ -> throwError [EndOfEval]

-- Return and discard the head term
pop :: EvalState t t
pop = lift get >>= \case 
    (a:as, bs, e) -> put (as, bs, e) >> return a
    _ -> throwError [EndOfEval]

-- Flip the inner lists
-- Used when the list is empty and needs to reset
refresh :: EvalState t ()
refresh = modify $ \(a, b, e) -> (b, a, e)

-- Get the EvalEnv from the state
getEnv :: EvalState t EvalEnv
getEnv = lift get >>= \case (_, _, e) -> return e

-- Set the EvalEnv in the state
putEnv :: EvalEnv -> EvalState t ()
putEnv env = modify $ \(a, b, _) -> (a, b, env)

-- Apply a function to the env in the state
modifyEnv :: (EvalEnv -> EvalEnv) -> EvalState t ()
modifyEnv f = getEnv >>= \env -> putEnv (f env)

-- Run the evaluation
runEval :: [t] -> EvalState t a -> Either [EvalError] a
runEval t s = evalState (runExceptT s) (t, [], defaultEnv)
```

## Practice
We can write two functions that are more practical to typing:
```haskell
putBinder :: (String, Ty) -> EvalState FITerm ()
putBinder s = modifyEnv $
    \EvalEnv{binders} -> EvalEnv{binders = s:binders}

lookupBinder :: FI -> String -> EvalState FITerm Ty
lookupBinder fi s = do
    binders <- binders <$> getEnv
    case lookup s binders of
        Just t  -> return t
        Nothing -> throwError [UnboundVariable fi s]
```
Here, for instance, we can write a `typeof` for abstractions and variables:

```haskell
typeof' :: FITerm -> EvalState FITerm Ty
-- Typing for abstractions
typeof' (_, TmAbs v ty t) = putBinder (v, ty) >> (Abs ty <$> typeof' t)
-- Typing for variables
typeof' (fi, TmVar s) = lookupBinder fi s

typeof :: EvalState FITerm Ty
typeof = check >>= typeof'
```
