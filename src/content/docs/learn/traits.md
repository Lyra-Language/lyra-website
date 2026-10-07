---
title: Traits and Generics
description: Declaring traits, implementing them, default methods, bounds on generic code, Show, and operator overloading.
---

A **trait** names a set of methods that a type can provide. Generic code can then work with
any type that has those methods. If you know Rust's traits, Haskell's type classes, or
Go's or Java's interfaces, it's the same idea. Unlike Go, a type has to say explicitly that
it implements one.

## Declaring and implementing

```lyra
trait Describe {
  pure describe: (Self) -> string
}

struct Dog { name: string }
struct Robot { model: i64 }

impl Describe for Dog {
  describe = (self) => "${self.name} the dog"
}

impl Describe for Robot {
  describe = (self) => "robot model ${self.model}"
}

let main = () -> void => {
  println(Dog { name: "Rex" }.describe()) // Rex the dog
  println(Robot { model: 7 }.describe()) // robot model 7
}
```

Inside a trait, **`Self`** means "the type implementing this". Each method is a name and a
function type. The `impl` block gives each method its body. Parameter types aren't repeated
there, since the trait already says them.

`pure` on the trait's method is a promise that **every** implementation keeps: each one is
checked against it. That's what lets a `pure` caller use the trait without knowing which
type it'll get. See [Effects](/learn/effects/).

## Default methods

A trait can give a method a body that implementations inherit. An implementation can still
replace it:

```lyra
trait Greeter {
  pure name: (Self) -> string
  pure greet: (Self) -> string = (self) => "Hello from ${self.name()}"
}

struct English { who: string }
struct Pirate { who: string }

impl Greeter for English {
  name = (self) => self.who
}

impl Greeter for Pirate {
  name = (self) => self.who
  greet = (self) => "Ahoy from ${self.who}"
}

let main = () -> void => {
  println(English { who: "Ada" }.greet())     // Hello from Ada
  println(Pirate { who: "Anne" }.greet())     // Ahoy from Anne
}
```

## Bounds: generic code that needs a trait

A `where` clause says which traits a type variable must implement. Inside the function you
can call those traits' methods. At each call, the compiler checks that the actual type
qualifies:

```lyra
trait Shape {
  pure area: (Self) -> f64
}

struct Square { side: f64 }

impl Shape for Square {
  area = (self) => self.side * self.side
}

let total_area<t> where t: Shape = pure (shapes: []t) -> f64 => {
  var total = 0.0
  for s in shapes { total += s.area() }
  total
}

let main = () -> void => {
  println(total_area([Square { side: 1.0 }, Square { side: 2.0 }]))   // 5
}
```

Several bounds are joined with `+`: `where t: Shape + Show`. Generic code is compiled
separately for each type it's used with, so it runs as fast as code written for that one
type.

## Traits from the standard library

A few traits come with the language and are worth knowing:

| Trait                      | What it gives you                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `Show`                     | `show`, which turns a value into text. Implementing it lets `println` and `"${…}"` display your type.                           |
| `Ord`                      | `compare`, which gives `Less`, `Equal` or `Greater`. Implementing it gives your type `<`, `>`, `<=>`, sorting, `min` and `max`. |
| `From<x>`                  | `from`, a conversion from an `x`. `?` uses it to convert error types.                                                           |
| `Add`, `Sub`, `Mul`, `Div` | the arithmetic operators (below).                                                                                               |
| `Hash`                     | lets your type be a `HashMap` key.                                                                                              |

`Show` is the one you'll write most often:

```lyra
struct Money { cents: i64 }

impl Show for Money {
  show = pure (self) => {
    let pennies = "${self.cents % 100}".pad_start(2, "0")
    "${self.cents / 100}.${pennies} USD"
  }
}

let main = () -> void => {
  let price = Money { cents: 1250 }
  println(price)                      // 12.50 USD
  println("That costs ${price}.")
}
```

## Operator overloading

Implementing the arithmetic traits lets your type use the operators. An operator method is
named by the operator itself, with `_` marking where the operands go:

```lyra
struct Vec2 { x: f64, y: f64 }

impl Add for Vec2 {
  (_+_) = pure (self, other) => Vec2 { x: self.x + other.x, y: self.y + other.y }
}

let main = () -> void => {
  let v = Vec2 { x: 1.0, y: 2.0 } + Vec2 { x: 3.0, y: 4.0 }
  println("${v.x}, ${v.y}")    // 4, 6
}
```

Comparisons work differently: `==` compares any two values of the same type field by
field, with nothing to write, and `<`, `>` and `<=>` come from implementing `Ord`.

## Calling a method that has no receiver

Some trait methods don't take a `Self`. They _produce_ one, like `from` above. You call
those through the trait's name, `Trait::method(…)`, and the compiler picks the
implementation from the type you're asking for:

```lyra
data Level = Low | High

impl From<i64> for Level {
  from = pure (n) => if n > 5 { High } else { Low }
}

let main = () -> void => {
  let level: Level = From::from(9)
  println(level == High)    // true
}
```

Next: [Effects: pure, det and noalloc](/learn/effects/).
