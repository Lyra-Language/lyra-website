---
title: "Reading Lyra: a Cheat Sheet"
description: Every piece of Lyra syntax on one page, with what it means — for reading code you didn't write.
---

Keep this page open while you read someone else's Lyra. Each row links to the page that
explains it.

## Declarations

| You see | It means |
|---|---|
| `let x = 5` | A binding that can't be reassigned. [→](/learn/basics/#bindings) |
| `var x = 5` | A binding that can be reassigned. |
| `const LIMIT = 10` | A value known before the program runs. |
| `let x: u8 = 5` | A binding with its type written out. |
| `let f = (a: i64) -> i64 => a * 2` | A function named `f`. [→](/learn/functions/) |
| `let f = pure (…) -> T => …` | A function that promises to have no effects. [→](/learn/effects/) |
| `let f<t> where t: Ord = …` | A generic function; `t` must implement `Ord`. [→](/learn/functions/#generic-functions) |
| `let f = (n: i64) -> T { (0) => …, (n) => … }` | A function defined by clauses, first match wins. [→](/learn/functions/#multi-clause-functions) |
| `let area = (self: Rect) -> …` | A function callable as `r.area()`. [→](/learn/functions/#methods) |
| `impl Rect { let area = (self) -> … }` | The same, grouped under its type; `self` is a `Rect`. [→](/learn/structs-and-data/#methods-on-a-struct) |
| `impl Rect { let grow = (self: mut, …) … }` | A method that changes its receiver (`self: ref` borrows to read). |
| `impl Pair<a, b> where a: Show { … }` | Methods on every `Pair` whose `a` can be shown. [→](/learn/structs-and-data/#generic-structs) |
| `struct P { x: f64, y: f64 = 0.0 }` | A record type; `y` has a default. [→](/learn/structs-and-data/) |
| `data Shape = Circle(f64) \| Dot` | A type whose value is exactly one of the cases. [→](/learn/structs-and-data/#data-types) |
| `tuple Rgb(u8, u8, u8)` | A named tuple type. [→](/guides/types/tuples/) |
| `newtype Meters = f64` | A distinct type with `f64`'s representation. [→](/guides/types/newtypes/) |
| `trait Show { show: (Self) -> string }` | A set of methods a type can implement. [→](/learn/traits/) |
| `impl Show for P { show = … }` | `P` implements `Show`; not the same as `impl P { … }`. [→](/learn/traits/#declaring-and-implementing) |
| `pub` | Visible to other modules. [→](/learn/modules/) |
| `import a.b` / `import a.b.{ x, y }` | Bring in a module by name / bring in some of its names. |

## Types

| You see | It means |
|---|---|
| `i8` … `i128`, `u8` … `u128` | Integers, signed and unsigned, of that many bits. |
| `f16`, `f32`, `f64` | Floating-point numbers. |
| `bool`, `string`, `rune` | True/false, UTF-8 text, one Unicode character. |
| `[]T` | A growable array of `T`. [→](/guides/types/arrays/) |
| `[4]T` | An array of exactly four `T`, stored inline. |
| `(i64, string)` | A tuple. |
| `Maybe<T>` | A `T`, or nothing: `Some(v)` or `None`. [→](/learn/errors/) |
| `Result<T, E>` | A `T`, or an error `E`: `Ok(v)` or `Err(e)`. |
| `(i64) -> bool` | A function taking an `i64` and returning a `bool`. |
| `t`, `a`, `b` (lowercase) | A type variable: any type. |
| `Self` | Inside a trait: the type implementing it. |
| `shared T` | A reference-counted `T`; copies share one value. [→](/learn/structs-and-data/#copying-and-sharing) |
| `mut T`, `ref T`, `own T` (on a parameter) | Borrowed to change, borrowed to read, or handed over. [→](/learn/functions/#how-arguments-are-passed) |
| `void` | No value. |

## Expressions

| You see | It means |
|---|---|
| `"Hi ${name}"` | String with an expression put inside. |
| `` `C:\raw` `` | Raw string: no escapes, no interpolation. |
| `'a'` | A rune. |
| `a ++ b` | Join two strings. |
| `a % b` / `a %% b` | Remainder with the sign of `a` / of `b`. [→](/learn/basics/#arithmetic) |
| `a ~ b` | Bitwise exclusive-or. |
| `a <=> b` | Compare: `Less`, `Equal` or `Greater`. |
| `0..<5`, `0..<=5`, `5..>0`, `5..>=0` | Ranges: up or down, end excluded or included. [→](/learn/control-flow/#ranges) |
| `0..<10:2` | A range in steps of 2. |
| `[1, 2, 3]` / `#[1, 2, 3]` | A growable array / a fixed-size array. |
| `[x in xs \| x > 0 \| x * 2]` | Array comprehension: source, filter, result. [→](/guides/types/arrays/#array-comprehensions) |
| `[...xs, 4]` | A new array: the elements of `xs`, then `4`. |
| `P { x: 1.0 }` | Make a struct. |
| `P { p \| x: 2.0 }` | Copy `p` with `x` changed. [→](/learn/structs-and-data/#copying-with-changes) |
| `Some(5)`, `Some 5` | Make a value of a `data` case (both spellings work). |
| `(x) => x * 2` | A lambda. |
| `xs.map(f)` | Calls `map(xs, f)`. |
| `f64(n)` | Convert `n` to `f64`. |
| `v?` | Unwrap, or return the `Err`/`None` from this function. [→](/learn/errors/#passing-failures-up-with-) |
| `m ?? d` | The value in `m`, or `d` if there is none. |
| `m?.field` | `field` of the value in `m`, or `None`. |
| `if c { a } else { b }` | Either branch's value. [→](/learn/control-flow/) |
| `match v { p => r, … }` | The result of the first arm whose pattern fits. |
| `Trait::method(x)` | Call a trait method picked by the type the result is used as. |
| `unsafe { … }` | Code allowed to use raw pointers; used only for calling C. |

## Statements

| You see | It means |
|---|---|
| `for { … }` | Loop forever (until `break`). [→](/learn/control-flow/#for-is-the-only-loop) |
| `for cond { … }` | Loop while `cond` holds. |
| `for var i = 0; i < n; i += 1 { … }` | C-style loop. |
| `for x in xs { … }` / `for i, x in xs { … }` | Each element / each element with its position. |
| `outer: for …` then `break outer` | Leave a labelled outer loop. |
| `if let Some(v) = m { … }` | Run the block only if the pattern matches. [→](/learn/control-flow/#if-let-and-let--else) |
| `let Some(v) = m else { return }` | Bind for the rest of the block, or leave. |
| `let (a, b) = pair` | Take a tuple apart. |
| `(a, b) = (b, a)` | Assign several places at once (here, a swap). |

## Comments and attributes

| You see | It means |
|---|---|
| `// …`, `/* … */` | Comments. |
| `/// …` | Documents the declaration below. [→](/learn/modules/#documentation-comments) |
| `//! …` | Documents the whole module. |
| `@derive(Ord)` | Writes an implementation for you. |
| `@link("SDL3")`, `@symbol("…")`, `extern` | Calling C libraries. |

## Patterns

| Pattern | Matches |
|---|---|
| `0`, `"quit"`, `'x'` | That exact value. |
| `1 \| 2 \| 3` | Any of them. |
| `1..<=9` | Anything in the range. |
| `n`, `_` | Anything; binds it to `n` / binds nothing. |
| `n if n > 0` | Anything passing the guard. |
| `big @ 100..<1000` | The range, binding the value to `big`. |
| `(x, 0)` | A tuple, piece by piece. |
| `[]`, `[x]`, `[head, ...rest]` | An array by its shape. |
| `Point { x, y }` | A struct, binding fields. |
| `Some(v)`, `Err(e)`, `Circle(r)` | A `data` case and its contents. |
| `r"^[a-z]+$"` | A string matching a regular expression. [→](/guides/regex/) |
