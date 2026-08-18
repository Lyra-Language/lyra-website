---
title: Primitive Types
description: The usual suspects
---

Lyra supports the following primitive types:

```lyra
// Signed integers
let a: i8 = 0
let b: i16 = 0
let c: i32 = 0
let d: i64 = 0
let e: i128 = 0

// Unsigned integers
let f: u8 = 0
let g: u16 = 0
let h: u32 = 0
let i: u64 = 0
let j: u128 = 0

// Floats
let k: f16 = 0.0
let l: f32 = 0.0
let m: f64 = 0.0

// A Unicode code point
let n: rune = 'x'

// Text and truth
let p: string = "hello"
let q: bool = true
```

There is no platform-dependent `int` or `uint`: a width that changes with the
target defeats determinism, so every integer says how wide it is. An untyped
integer literal defaults to `i64` and an untyped float literal to `f64`.

A fixed-point type is written `fixed<8,24>` — 8 integer bits and 24 fractional — and
parses today, but no value of one can be constructed yet (`lyra-E055`). Use `f64` for
fractional arithmetic, or a `newtype` over an integer with a `where range(...)` constraint
for a scaled integer.

There is no `char` either. A character is a `rune` — a Unicode code point, 32
bits wide — which is what `for c in s` yields when walking a string.
