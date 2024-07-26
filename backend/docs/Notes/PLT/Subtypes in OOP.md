## All About Safety
In an OPP language which is featured with subclasses, we may create a class which may not be *safe*, which means it will show unexpected results and make everything harder when debugging. Here *safe* is equivalent to violation of rules in subtypes. That is, in many OOP languages like Java and C++, creation of unsafe subclasses is allowed and they are actually not *true subtype* and what we need to avoid.

## Subclasses != Subtypes
As mentioned, subclasses may violate some rules that are essential for subtyping and make itself not true subtypes in some way.

### True Subtype for Subclasses
We can conclude rules in subtyping in this way:
1. **Conceptually B <: A means every B is an A.** Places where an A object appears can be safely substituted by a B object.
2. **Hence, members in B are subtypes of members in A** This implies two rules:
   - B cannot reduce methods or properties from A
   - Any single member in B is a subtype of that in C correspondingly.
3. **Hence, exceptions thrown from B are subtypes of ones thrown from A**

Where we introduce substitution in subtyping. For a true subtype, substitution should be safe. That is, for any case where A appears, B is supposed to work well. 

### Principles in Substitution for Subclasses
Substitution for a true subtype should comply with **Liskov Substitution Principle**. Otherwise it may produce unexpected behaviors and vulnerabilities.

> - *A subclass should be substitutable for superclass*
> - *Ensure that B is a true subtype of A by reasoning at the specification level*

Specification level ensures the behavior of a subtype (have *stronger* specification) is exactly the same as its supertype (have *weaker* specification). A true subtype requires **weaker spec** and returns or effects **stronger spec** (*the rule of variance in function; covariance in return types and contravariance in parameter types*).For example, as we declare `A` extends `B`:

```java
// In interface A
Object method (String str);

// In interface B extends A
String method (Object str);
```
This is safe. In required types (parameter's types), `Object` holds weaker spec than String. In returned types, `String` holds stronger spec. Therefore, it is safe and A's method can be replaced by B's.
> However it's unable to write methods overriding with parameter types that differs from its superclass in Java or C++. Because these languages support method overloading which makes ambiguity:
>```java
>// In class A
>Object method (String str) { ... };
>Object method (Integer str) { ... };
>
>// In class B extends A
>String method (Object str) { ... }; 
>// Which will I override??
>```
>Instead, those who don't support overloading may allow contravariance in parameters like OCaml.

## Dangerous Subclass

### Example : Container

We can define a container expected to hold at most 3 elements, which contain a method "addElement" making effects unless the capacity is greater than 3. And another container class which extends the former contain a method "dangerousAddElement" making effects whatever the case. Then conceptually we expect a stronger spec for the subtype but what we do is to weaken the spec, making violation to the rules of subtyping.

### Example : Square and Rectangle
We know every square is a rectangle, but it seems unable for subclasses to really make this reasonable.  

In Rectangle, we have "setSize(w, h)" to set its size. By intuition a square should satisfy w == h and we have three ways:
- Override "setSize(w, h)" that definitively requires w == h
- Override "setSize(w, h)" that throws exception unless w == h
- Define "setSize(e)" that refers e to the edge length

The first one isn't correct because it requires stronger spec than its superclass.  
The second one isn't correct because it returns weaker spec (that is, an exception is returned which is too many for a subclass).  
The last one isn't correct as well because it actually adds another method to its superclass while "setSize(w, h)" still works and enables us to define a "inequilateral square".  

One plausible approach is to specify Rectangle to throw exceptions that Square will do in "setSize(w, h)". Also we can define "setScale(f)" to change the size regardless of its shape to avoid the risk.