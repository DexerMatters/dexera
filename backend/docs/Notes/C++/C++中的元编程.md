## C++中的元编程
&emsp;&emsp;元编程（Meta-programming）是一种在编译时期解释执行的代码，不同于运行时的代码，这种代码是类型进行“运算”，在类型推导与泛型的处理中扮演着重要的角色。C++也是在11版本以及之后慢慢在完善这个系统，以至于目前已经图灵完备。虽然这个系统目前还有些不妥之处，但是我们依然可以在C++中运用元编程的思想写一些有趣的代码。

## 常量编程
&emsp;&emsp;元编程不允许可变状态的存在，那样会使得类型的推导难以决定，同时对于元编程中发生的异常难以处理。所以我们将借助`constexpr`，`using`，与`consteval`等关键词来进行编程。
### 等价
&emsp;&emsp;我们可以把C++的元编程代码（面向类型）与运行时代码进行一些比较，从而方便我们的后续学习。

| 面向值 | 面向类型 |
|:---|:---|
|**赋值**||
|`int s = 1;`|`using S = int;`<br>我们使用`using`给了int一个别名S|
|**传值**||
| `int s = 1;`<br>`int t = s;`| `using S = int;`<br>`using T = const S&;`<br>我们创造了一个S类型的常量引用类型|
|**函数**||
| `int s = 1;`<br>`int t = s;`<br>`int r = foo(t);`| `using S = int;`<br>`using T = const S&;`<br>`using R = std::remove_reference<T>::type`<br>我们将T的引用移除了得到`const S`|
|**比较**||
|`bool b = a == b`| `constexpr bool b = std::is_same<A, B>::value`|
|**条件**||
|`bool b = a == b;`<br>`if (b)`<br>`...`| `constexpr bool b = std::is_same<A, B>::value;`<br>`if constexpr (b)`<br>`...`|
## 元函数（Meta-Function）
&emsp;&emsp;元函数往往和用结构体定义，以模板的方式输入类型（常量）作为参数，然后用成员类型（常量）作为输出类型（常量）。往往我们会定义类型成员`type`为输出的类型，而静态成员`value`为输出的常量。我们在这里可以做个小比较。
>&emsp;&emsp;在C++17之后，模板允许基本类型的常量作为参数，这些常量会参与编译时运算，例如声明数组时`int[N]`中的`N`便是典型的编译时常量，它若是变量，那么变量必须在**编译时确定**，例如：
> ```cpp
> int a = 12;
> int arr[a]; //Error
> 
> constexpr int a = 12;
> int arr[a]; //Ok
>
> template<int N>
> void func() {
>   int arr[N]; //Ok
> }
> ```

|函数|元函数|
|:---|:---|
|`fun(a, b)`|`fun<A, B>::value`|
|`decltype(fun(a, b))`|`fun<A, B>::type`|
### 定义一个元函数
&emsp;&emsp;我们首先来定义一个非常简单的元函数，输入类型和整数，输出相同类型和整数。
```cpp
template <typename T, int V> // A为类型，I为整型常量
struct Id {
  using type = T;
  static const int value = V;
};

Id<bool, 12>::type // bool
Id<bool, 12>::value // 12
```
&emsp;&emsp;我们再试试写一个`Pair`结构
```cpp
template <typename A, typename B>
struct Pair {
  using first_type = A;
  using second_type = B;
};

Pair<bool, int>::first_type // bool
Pair<bool, int>::second_type // int
```

> ### typename
>&emsp;&emsp;`typename`关键词在元编程中有一个非常重要的用法，也就是它能够使得编译器将其作用的表达式看作为类型的*声明*，例如我们如果需要将`Id<bool, 12>::type`的类型充当一个变量的类型，我们需要：
>```cpp
> typename Id<bool, 12>::type b = false;
> // 编译为 bool b = false;
>```
> &emsp;&emsp;这样会让编译器知道`Id<bool, 12>::type`在此处并非一个元编程中的类型变量，而是作为一个类型的实例。
> ### `using A = t` v.s. `typedef t A`
> &emsp;&emsp;绝大部分情况，这两种声明变量别名的方法是等价的，但是在元编程中，特别是作为结构体的成员时，后者的实例*不需要typename*。如果我们将`Id`的`using type = T`改为`typedef T type`，那么我们在其充当变量类型时候，只需要：
>```cpp
> Id<bool, 12>::type b = false;
> // 编译为 bool b = false;
>```
> &emsp;&emsp;本教程为了便于理解，所以全部以前者为主，但是在标准库中，`type`作为成员往往是后者的定义方法。

&emsp;&emsp;接下来我们试着来定义一下标准库里面的`std::is_same<A,B>`，这个元函数能够帮我们判断两个类型是否相等。首先我们先讨论A和B是整数常量：
```cpp
template <int A, int B>
struct is_same {
  static const bool value = A == B;
};

is_same<1, 1>::value //true
is_same<1, 2>::value //false
```
然后我们来讨论A和B是类型的情况，但我们很快发现了问题，我们在结构体内部不借助`std::is_same`的情况下，无法判断是否两个类型相同。此时，我们需要用到C++的类型匹配。

### 元函数中的模式匹配
#### 泛型（Generics）
&emsp;&emsp;在C++中，模板类其实是一种泛型，泛型是一种多态性（polymorphism）的体现，指的是一种类型，它可以根据上下文的推断从而在编译时变成某种类型。
#### 特化（Specialize）
&emsp;&emsp;在ML语言中，例如Haskell，我们经常将参数的不同情况进行分开定义，例如：
```haskell
bool2Int :: Bool -> Int
bool2Int True = 1 -- specialized for case True
bool2Int _ = 0 -- default case
```
&emsp;&emsp;实际上，我们可以将这种，把参数不同情况分开定义，称作**特化**，传入的参数是广泛的，例如泛型，为了讨论它的不同类型，或者不同情况，往往采用特化的方法进行分开定义。而传入的参数只需要经过匹配，便可以找到符合它的定义。例如：
```cpp
//Generic as a default case
template <bool B>
struct bool2Int {
  static const int value = 0;
};

//Specialized for case `true`
template <>
struct bool2Int<true> {
  static const int value = 1;
};
```
还例如：
```cpp
//Generic as a default case
template <typename T>
struct is_integral{ 
  static const bool value = false;
};

//Specialized for case `int`
template <>
struct is_integral<int> {
  static const bool value = true;
};

//Specialized for case `short`
template <>
struct is_integral<short> {
  static const bool value = true;
};

...
```

#### 部分特化（Partially Specialize）
&emsp;&emsp;如果在特化中，也有模板类型（多态类型）的存在，那么就相当于我们对传入的类型参数进行了**部分特化**，有一部分依然可以为任何类型。有了这个，我们可以定义`is_same`了!
```cpp
//Generic as a default case
template <typename A, typename B>
struct is_same {
  static const bool value = false;
};

//Partially specialized for the case when parameters are all `T` (the same)
template <typename T>
struct is_same<T, T> {
  static const bool value = true;
};
```
&emsp;&emsp;我们试着定义标准库中的一个元函数`std::conditional<B,T,F>`，当第一个参数B为`true`时返回类型`T`，否则返回类型`F`。
```cpp
//Generic as a default case
template <bool B, typename T, typename F>
struct conditional {
  using type = F;
};

//Partially specialized for B = true
template <typename T, typename F >
struct conditional<true, T, F> {
  using type = T;
};
```
&emsp;&emsp;我们试着定义标准库中的一个元函数`std::remove_const<T>`，若T是一个常量类型（如`const int`），则会去掉常量，返回原类型（`int`）
```cpp
//Generic as a default case
template <typename T>
struct remove_const {
  using type = T;
};

//Partially specialized when applied with const T
template <typename T>
struct remove_const<const T> {
  using type = T;
};
```
&emsp;&emsp;我们试着定义标准库中的一个元函数`std::remove_reference<T>`，若T是一个引用类型（如`int& int&&`），则会去掉引用，返回原类型（`int`）
```cpp
//Generic as a default case
template <typename T>
struct remove_reference {
  using type = T;
};

//Partially specialized when applied with &T
template <typename T>
struct remove_reference<&T> {
  using type = T;
};

//Partially specialized when applied with &&T
template <typename T>
struct remove_reference<&&T> {
  using type = T;
};
```
### 标准库中的元函数
>&emsp;&emsp;你可以从这里找到标准库中所有元函数：
https://en.cppreference.com/w/cpp/meta
### 元函数作为类型容器
&emsp;&emsp;在常量编程中，我们可以利用**std::tuple\<T1,T2,...\>**与**std::pair\<A,B\>**来存放类型。
#### std::tuple
```cpp
using Ts = std::tuple<int, bool, float, string>;
std::tuple_size<Ts>::value // 4
std::tuple_element<1, Ts>::type // bool
std::tuple_element<2, Ts>::type // float
```
#### std::pair
```cpp
using Ts = std::pair<float, string>;
Ts::first_type // float
Ts::second_type // string
```
## 类型推导（Template Type Deduction）
&emsp;&emsp;C++中的类型推导往往是从运行时的值出发，来推出模板类型的具体类型，或者`auto`的类型。由于值的类型是被确定的，那么类型推导必须推导出另外一个确定的类型，否则会发生错误 （deduction fails. T is ambiguous）
### 从参数推导
&emsp;&emsp;在我们写出`std::pair p(2, 4.f);`这样的函数时候，即使我们并没有用模板方式传入`pair`两值的类型，编译器也自动推断出`std::pair<int, float>`，这种过程就是一种**类型推导**。  
&emsp;&emsp;相信学过模板编程的读者应该知道，一个函数当参数为模板类型时，模板类型会根据参数自动推断出自己的类型，例如：
```cpp
template <typename T, typename S>
void foo(T a1, S a2) {
  //...
};
template <typename T>
void bar(T a1, T a2) {
  //...
};
foo (1, 1.f) // 推断出 T = int; S = float
bar (1, 1) // 推断出 T = int
bar (1, 1.f) // Error, 无法确定T是int还是float
```
#### std::initializer_list\<T\>
&emsp;&emsp;阅读文档我们可以知道，这个结构体能够帮助我们把类型为T的数组的每一项类型去掉`const`，`volatile`或者`&`，`&&`，那么当其作为参数类型时，`T`也可以通过参数数组的元素类型做出推导。
```cpp
template <typename T>
void foo(std::initializer_list<T> arr) {
  //...
};

foo ({1, 2}) //Ok, T = int
foo ({1, 2.f}) //Error, 无法确定T是int还是float

```
#### std::tuple\<T...\>
&emsp;&emsp;下面我们再以元组举例加深理解参数的类型推导：
```cpp
template <typename A, typename B>
void foo(std::tuple<A, A, B> t) {
  //...
};

foo (std::tuple(1, 2, 3)) //Ok, A = int; B = int
foo (std::tuple(1, 2, "Hello")) //Ok, A = int; B = const char*
foo (std::tuple(1, 2.f, "Hello")) //Error, 无法确定A是int还是float
```

#### 常量模板的推断
&emsp;&emsp;类似于`template <int I>`的这种常量模板也是可以从参数推断出`I`的值，比如传入的是一个静态数组：
```cpp
template <size_t N>
void foo(int (&arr)[N]) {
  //...
};
int i[3] = {1, 2, 3};
foo (i) // 推断出 N = 3
```
### 从模板推导
&emsp;&emsp;在之前我们定义了一个比较常量的`is_same`，但是它只能够对int类型的常量进行比较。为了使得它能够兼容所有可比较的类型，我们需要做到从模版中推导类型：
```cpp
// 两个常量本身类型不同
template <typename T1, typename T2, T1 A, T2 B>
struct is_same {
  static const bool value = false;
};

// 两个常量类型相同
template <typename T, T A, T B>
struct is_same {
  static const bool value = A == B;
}

is_same<1, 2.f>::value //推导出T1 = int; T2 = float; 结果为false
is_same<1, 2>::value //推导出T = int; 结果为false;
is_same<1, 1>::value //推导出T = int; 结果为true;
```
### 从返回值推导
&emsp;&emsp;C++14及以后，`auto`可以作为返回值类型参与返回值的推导过程，这样我们可以允许更弹性的返回值。
#### 非模板情况
```cpp
// 两个常量本身类型不同
auto foo() {
  return 12;
}
//auto推断为int
```
#### 模板情况
&emsp;&emsp;`decltype(auto)`作为返回的占位符能够允许我们进行更高阶的推断，例如从模板的类型推断出返回值的类型，例如下面代码：
```cpp
// Fun：函数的类型
// Args：函数参数的类型
template<class Fun, class... Args>
decltype(auto) Example(Fun fun, Args&&... args) 
{ 
    return fun(std::forward<Args>(args)...); 
}
```

## 模板参数包（Template Parameter Pack）
&emsp;&emsp;我们在实际开发中，可能会遇见不定参数的情况，也就是参数数量可变，这种函数称为**不定函数**（Varadic Function），例如`printf`。在C语言的开发经验中，我们可以使用`va_arg`等相关函数来制造出不定函数，而自C++11后，我们可以从模板出发，用模板参数包的形式规定不定函数的参数类型。
```cpp
template<class... Types>
void f(Types... args) {

};

f(0) // Types 包含一个类型，int
f(1, 2) // Types 包含两个类型，int与int
f(1, 2, 1.4) // Types 包含三个类型，int, int与double
```
&emsp;&emsp;对于结构体（原函数）我们依然可以使用模板参数包，使得其传入类型不定。
```cpp
template<class... Types>
struct Tuple {};
 
Tuple<> t0;
Tuple<int> t1;
Tuple<int, float> t2;
Tuple<0> t3; // Error, 0并不是类型
```
&emsp;&emsp;而参数包也可以与普通模板类进行混合定义，例如`template<class T, class... Ts>`，不过普通模板类需要位于参数包的前面，而且在模板声明中*普通模板类可以有多个，而参数包只能有零或一个*。像`template<class... Ts, class T>`，`template<class... As, class... Bs>`均不合法。

### 参数包的展开（Extension）
```cpp
template<class... As>
void f(As... args) {

};

template<class... Bs>
void f2(Bs... args) {
  f(args...); // 将参数包展开作为f的参数
};
```

&emsp;&emsp;如果将`f2`的`args`看作`a1, a2, a3, ...`，那`f(args...)`中的`args...`的展开就相当于将此表达式替换为`f(a1, a2, a3, ...)`

```cpp
template<class A, class... As>
struct Foo {};

template<class... Bs>
struct Bar {
  using mFoo = Foo<Bs...>; 
  // 将参数包展开作为结构体的模板参数
};
```
&emsp;&emsp;如果将`Bar`的`Bs`看作`T1, T2, T3, ...`，那`Foo<Bs...>`中的`Bs...`的展开就相当于将此表达式替换为`Foo<T1, T2, T3, ...>`，所以不难看出，对于Foo而言，此时`A`为`T1`，而`As`为`T2, T3, ...`


#### 展开的规则（规则均可以叠加）
|表达式|展开后|
|--|--|
|**对于参数变量**||
|args...|a1, a2, a3, ...|
|&args...|&a1, &a2, &a3, ...|
|++args...|++a1, ++a2, ++a3, ...|
|fun(args)...|fun(a1), fun(a2), ...|
|fun(&args)...|fun(&a1), fun(&a2), ..|
|**对于模板类型**||
|Ts...|T1, T2, T3, ...|
|F\<Ts\>...|F\<T1\>, F\<T2\>, F\<T3\>, ...|
|**对于两者混合**||
|fun\<Ts\>(args)...|fun\<T1\>(a1), fun\<T2\>(a2), ..|



### 参数包的运算符
&emsp;&emsp;`sizeof...(args)`与`sizeof...(Ts)`能够返回参数包的长度; 在C++26版本及以后`args...[N]`与`Ts...[N]`能够返回参数包某一位的值或类型（N需要是编译时常量）。因此我们能够通过这个特性来遍历参数包，但是很多时候我们的编译器版本并没有那么新，所以在本篇不会介绍用这种方法遍历参数包。
>&emsp;&emsp;实际上在C++26之前，我们也可以用借助元组来实现访问参数包的某一位。
>```cpp
>template<typename... Ts>
>void foo(Ts... args){
>  auto t = std::make_tuple<Ts>(args);
>  using typeAt3rd = std::tuple_element<3, Ts>::type;
>  auto valueAt3rd = get<3>(t);
>}
>
>```

### 参数包的遍历
#### 模板匹配法
```cpp
template<size_t I, typename Head, typename... Rest>
void foreach(Head arg, Rest... rest) {
  std::cout << I << " : " << arg << std::endl;
  if constexpr (sizeof...(Rest) != 0)
    foreach<I + 1, Rest...>(rest...);
};


template<typename... Ts>
void foo(Ts... args) {
  foreach<0, Ts...>(args...);
};
int main()
{
  foo(1,2.f,2.4);
}
```
&emsp;&emsp;在编译时：
- `foo`函数中，`Ts...`推导为`int, float, double`
- `Ts`拓展到`foreach`的模板参数中。此时，`I`为0，`Head`为`int`，而`Rest...`为`float, double`
- 执行每次遍历的操作的代码
- 设定递归的继续条件：若`Rest`参数包的长度不为0（即不为空）的时候，`I + 1`，而且`Rest`会继续被下一轮递归拆成`Head`和`Rest`
- 以此类推，直到`Rest`为空，递归终止

#### Lambda拓展法
&emsp;&emsp;在Lambda表达式中，我们也能够使用参数包，同时它会使得Lambda表达式展开为多个表达式。在对参数包的遍历中，我们能够使用这种策略：
```cpp
template <typename... Ts>
void foreach (Ts... inputs)
{
  int i = 0;
  ([&]
  {
    ++i;
    std::cout << i << " : " << arg << std::endl;
  } (), ...);
}
```
#### 函数分解法
&emsp;&emsp;这个方法实际上和Lambda拓展法几乎一模一样，只不过使用了`std::initializer_list`来陈装Lambda表达式，并用了两个函数实现。
```cpp
template <class F, class... Args>
void do_for(F f, Args... args) {
    int x[] = {(f(args), 0)...};
}

template <class... Args>
void foreach(Args... args) {
  int i = 0;
  do_for([&](auto arg) {
    ++i;
    std::cout << i << " : " << arg << std::endl;
  }, args...);
}
```
#### 运行时遍历法
&emsp;&emsp;*仅对于同类型的参数包*，我们可以将其展开为数组（严格来讲是`std::initializer_list`）然后通过for循环来进行一个遍历操作：
```cpp
template <typename... Ts>
void foreach(Ts... args) {
  int i = 0;
  for(const auto p : {args...})
    std::cout << i++ << " : " << arg << std::endl;
}
```
&emsp;&emsp;在这里，由于`{args...}`的存在，`Ts`的每一个类型必须相同，因为C++中的`{E1, E2, ...}`要求各表达式结果类型相同（或者规约后相同）