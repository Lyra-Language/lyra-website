---
title: Functions
description: Declaring and calling functions, lambdas and closures, methods, multi-clause functions, generics and parameter modes.
---

## Declaring a function

A function is a value like any other, and `let` gives it a name:

```lyra
let add = pure (a: i64, b: i64) -> i64 => a + b
```

Read it left to right: `add` is a `pure` function taking `a` and `b`, both `i64`. It
returns an `i64`, and its body is `a + b`. Call it the way you'd expect: `add(2, 3)`.

When the body needs more than one expression, give it a block. **The last expression in a
block is its value**, so there's usually no need for `return`:

```lyra
let hypotenuse = pure (a: f64, b: f64) -> f64 => {
  let squares = a * a + b * b
  squares.sqrt()
}
```

`return` is still there for leaving early:

```lyra
let first_negative = pure (xs: []i64) -> i64 => {
  for x in xs {
    if x < 0 { return x }
  }
  0
}
```

A function that returns nothing has the return type `void`. A function's parameters always
need types. The return type can be left off when the body makes it obvious, but writing
it is good documentation.

### Default values

A parameter can have a default, which a caller may leave out:

```lyra
let greet = pure (name: string, greeting: string = "Hello") -> string =>
  "${greeting}, ${name}!"

let main = () -> void => {
  println(greet("Ada"))           // Hello, Ada!
  println(greet("Ada", "Howdy"))  // Howdy, Ada!
}
```

Arguments are always passed by position. Lyra has no named arguments.

## Order doesn't matter

A file can use a function that is declared further down. Lyra programs are usually written
**top-down**: `main` first, then the functions it calls, roughly in the order they're
used. That way a reader meets the big picture before the details.

## Lambdas and closures

The same syntax with no name is a lambda. When a lambda is passed straight to another
function, its parameter types can usually be left out, because they're inferred:

```lyra
let main = () -> void => {
  let numbers = [1, 2, 3, 4, 5, 6]
  let evens = numbers.filter((n) => n %% 2 == 0)
  let squares = evens.map((n) => n * n)
  println(squares.join(", "))     // 4, 16, 36
}
```

A lambda can use bindings from around it. It **captures them by value**: it gets its own
copy, taken when the lambda is made. That's why a lambda can't assign to a captured `var`.
The compiler refuses, because the write would only change the lambda's copy and the
program would look like it worked.

```lyra
let make_adder = pure (k: i64) -> (i64) -> i64 => (x: i64) -> i64 => x + k

let main = () -> void => {
  let add_ten = make_adder(10)
  println(add_ten(5))    // 15
}
```

The type of a function is written like its signature: `(i64) -> i64` takes an `i64` and
returns an `i64`.

## Multi-clause functions

Instead of `=>` and one body, a function can list **clauses**. Each clause is a pattern
over the arguments and a result, and the first clause that matches wins:

```lyra
let fib = pure (n: i64) -> i64 {
  (0) => 0,
  (1) => 1,
  (n) => fib(n - 1) + fib(n - 2),
}

let describe = pure (n: i64) -> string {
  (0) => "zero",
  (n) if n < 0 => "negative",
  (_) => "positive",
}
```

The clauses must cover every possible input, which the compiler checks. `_` matches
anything and binds nothing. `if` after a pattern adds a condition (a _guard_). Patterns
are the same ones `match` uses; see [Control Flow](/learn/control-flow/).

## Methods

There are no classes. A function whose first parameter is named **`self`** can also be
called with a dot, on its first argument:

```lyra
struct Rect { width: f64, height: f64 }

let area = pure (self: Rect) -> f64 => self.width * self.height

let main = () -> void => {
  let r = Rect { width: 3.0, height: 4.0 }
  println(r.area())     // method style
  println(area(r))      // plain call: the same function
}
```

That's how the whole standard library works: `"text".len()`, `xs.map(f)` and
`m.unwrap_or(0)` are ordinary functions whose first parameter is `self`. The method form
chains well, `line.trim().to_ascii_lower()`, and reads in the order things happen.

Several functions can share a name when their `self` types differ. That's why `len` works
on strings and on arrays.

## Generic functions

A **lowercase** name in a type position is a type variable. It stands for any type, decided
at each call:

```lyra
let swap_pair<a, b> = pure (pair: (a, b)) -> (b, a) => (pair.1, pair.0)

let main = () -> void => {
  let swapped = swap_pair((1, "one"))
  println(swapped.0)    // one
}
```

When the body needs something from the type, such as comparing values or printing them,
say so with a `where` bound naming a [trait](/learn/traits/):

```lyra
let largest<t> where t: Ord = pure (xs: []t, fallback: t) -> t => {
  var best = fallback
  for x in xs { best = best.max(x) }
  best
}
```

Inside a generic function, compare through the trait's methods: `a.compare(b)` gives an
`Ordering`, and there are `max`, `min` and `clamp`. Operators like `<` and `<=>` work on
concrete types such as `i64` and `string`, but not yet on a type variable.

## How arguments are passed

By default an argument is passed **by value**. The function gets the value and can't
change the caller's copy. A **mode** before the type changes that:

| Mode     | Meaning                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------ |
| _(none)_ | By value.                                                                                        |
| `mut`    | Borrows the caller's variable so the function can change it. The caller must pass a `var`.       |
| `ref`    | Borrows without copying and without permission to change. Use it for large values you only read. |
| `own`    | Takes ownership: the caller gives the value up.                                                  |

```lyra
struct Counter { n: i64 }

let bump = (self: mut Counter) -> void => {
  self.n += 1
}

let main = () -> void => {
  var c = Counter { n: 0 }
  c.bump()
  c.bump()
  println(c.n)      // 2
}
```

`bump` isn't marked `pure`. Changing the caller's value is an effect the caller can see,
and `pure` rules that out. [Effects](/learn/effects/) explains what `pure` allows.

Next: [Control Flow](/learn/control-flow/).
