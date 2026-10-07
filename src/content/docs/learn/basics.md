---
title: Values and Bindings
description: let, var and const; numbers, strings and runes; operators, and converting between types.
---

## Bindings

A binding gives a name to a value. There are three kinds:

```lyra
const MAX_PLAYERS = 4    // known before the program runs; usually SHOUTING_CASE

let main = () -> void => {
  let name = "Ada"       // can never be reassigned
  var score = 0          // can be reassigned
  score += 10
  score = score * 2
  println("${name} scored ${score} of ${MAX_PLAYERS * 100}")
}
```

Start with `let` and switch to `var` only when you need to reassign. A reader who sees `let`
knows the value never changes, so there's less to keep in their head.

A type can be written after the name with a colon. Most of the time you don't need one,
because Lyra infers it from the value:

```lyra
let main = () -> void => {
  let small: u8 = 200     // without the annotation this would be an i64
  let ratio: f32 = 0.5
  let label = "points"    // inferred: string
  println("${small} ${ratio} ${label}")
}
```

Names of values and functions are `snake_case`. Names of types and constructors are
`PascalCase`. This is enforced, not just a convention, because the compiler uses the
capital letter to tell a constructor from a variable in a pattern.

### Shadowing

A new `let` can reuse a name that is already in scope. The new binding hides the old one
from that point on:

```lyra
let main = () -> void => {
  let input = "  42  "
  let input = input.trim()       // reads the old `input`, then hides it
  println(input)
}
```

Within one block this is quiet. Hiding a name from an *enclosing* scope draws a warning
(`lyra-W001`), and so does reusing a name the standard library already uses, such as `count`
or `sum`. Most of the time that's a typo or a confusion waiting to happen.

## Comments

```lyra
// An ordinary comment, to the end of the line.

/* A block comment,
   over several lines. */

/// A documentation comment: describes the declaration directly below it.
const ANSWER = 42
```

`//!` at the top of a file documents the whole module. Doc comments are Markdown.

## Numbers

Every integer type says how wide it is. There is no `int` whose size depends on the
machine:

| Kind | Types |
|---|---|
| Signed integers | `i8` `i16` `i32` `i64` `i128` |
| Unsigned integers | `u8` `u16` `u32` `u64` `u128` |
| Floating point | `f16` `f32` `f64` |

An integer literal on its own is an `i64` and a literal with a decimal point is an `f64`.
Literals can be written in several bases and broken up with underscores:

```lyra
let million = 1_000_000
let mask = 0xFF
let bits = 0b1010
let perms = 0o755
let tiny = 1.5e-3
```

**A literal must fit its type.** `let b: u8 = 300` is a compile error, not a silent
wrap-around.

## Arithmetic

The usual operators work: `+ - * /` and the comparisons `== != < <= > >=`. A few things
behave differently from what you may be used to:

- **Integer overflow stops the program.** `+`, `-`, `*` and `/` trap when the result
  doesn't fit, rather than wrapping around silently. When you *want* wrap-around, say so:
  `a.wrapping_add(b)`, `a.saturating_add(b)` (clamps at the edge) or `a.checked_add(b)`
  (gives you a `Maybe`; see [Maybe and Result](/learn/errors/)).
- **Integer division truncates**: `7 / 2` is `3`.
- **There are two remainders.** `%` takes the sign of the left operand, as in C, Go and
  Rust. `%%` takes the sign of the right operand, as Python's `%` does. `-7 % 3` is `-1`
  and `-7 %% 3` is `2`. For "which slot of a circular buffer" you almost always want `%%`.
- **`~` is exclusive-or**, not `^` (`^` is used for pointers). `&`, `|`, `<<` and `>>` are
  as usual. Bitwise operators bind tighter than comparisons, so `flags & MASK == 0` means
  what it reads as.
- **`<=>` compares three ways.** `a <=> b` is `Less`, `Equal` or `Greater`, which you can
  `match` on (see [Control Flow](/learn/control-flow/)).
- `&&`, `||` and `!` are the boolean operators.

```lyra
let main = () -> void => {
  let big: u8 = 250
  println(big.wrapping_add(10))       // 4
  println(big.saturating_add(10))     // 255
  println(big.checked_add(10) ?? 0)   // 0: the add overflowed, so the default
  println(-7 % 3)                     // -1
  println(-7 %% 3)                    // 2
  println(6 ~ 3)                      // 5
}
```

## Converting between types

Lyra never converts a number to another type behind your back. You convert by calling the
target type like a function:

```lyra
let main = () -> void => {
  let n = 7
  let half = f64(n) / 2.0      // 3.5
  let byte = u8(n)             // narrowing: truncates if it doesn't fit
  let rounded = 3.7.round()    // floor, ceil and round give an i64
  println("${half} ${byte} ${rounded}")
}
```

A literal adapts to the type next to it (`x + 1` with `x: f64` is fine). A *typed* integer
next to a float is refused, so write `f64(n)`.

## Strings and runes

A `string` is UTF-8 text and never changes once made. `++` joins two strings, and
`"${expr}"` puts any expression into one:

```lyra
let main = () -> void => {
  let who = "world"
  let greeting = "Hello, " ++ who ++ "!"
  println(greeting)
  println("2 + 2 = ${2 + 2}, and ${who.len()} letters")
  println("tab:\there, newline:\nthere")
}
```

A single character is a `rune`, a Unicode code point written in single quotes: `'a'`,
`'λ'`. A string is indexed and measured in runes, not bytes, so `"héllo".len()` is `5`.
To walk a string, loop over it. That gives you each rune, and optionally its position:

```lyra
let main = () -> void => {
  for i, c in "héllo" {
    println("${i}: ${c}")
  }
}
```

Backticks make a **raw string**. Everything inside is taken literally: backslashes,
newlines and `${`.

```lyra
let pattern = `C:\Users\${name}`
```

Some string methods you'll reach for often: `trim()`, `split(",")`, `lines()`,
`contains("x")`, `starts_with("x")`, `replace("a", "b")`, `to_ascii_upper()` and
`parse_i64()`. The [prelude reference](/reference/std-prelude/) lists them all.

## Booleans and the other basics

`bool` is `true` or `false`. There is no truthiness: `if n { … }` on a number is an error,
so write `if n != 0`. And there is no `null`. A value that might be missing has the type
`Maybe<T>`, covered in [Maybe and Result](/learn/errors/).

Next: [Functions](/learn/functions/).
