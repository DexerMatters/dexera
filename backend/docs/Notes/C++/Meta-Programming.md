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
### 元函数中的类型推导
todo