---
title: Array Types
description: Fixed and dynamic arrays, spreads, repeats, and comprehensions.
---

Lyra has two kinds of array, and the literal you write says which one you get.

A dynamic array has type `[]T`, where `T` is the element type. It lives on the heap, can grow,
and is written with plain brackets:

```lyra
var fibs: []i8 = [1, 1, 2, 3]
// Dynamic arrays support push
fibs.push(5)
let first = fibs[0] // arrays are zero-indexed
```

A fixed array has type `[N]T`, where `N` is the number of elements. Its elements are stored
inline, it never allocates, and it is written with `#[`:

```lyra
let rgb: [3]u8 = #[255, 128, 0]
let blue = rgb[2]
```

The two never convert into each other implicitly. Writing `[255, 128, 0]` where a `[3]u8` is
expected is an error that tells you to write `#[…]`, and the reverse is an error too. To get a
dynamic copy of a fixed array, call `.slice(0, n)`.

Element types still come from context, so `let small: []u8 = [1, 2]` stores `u8` elements.

Array elements can be inserted into another array literal with spread syntax. A spread always
builds a dynamic array:
```lyra
var fibs: []i8 = [1, 1, 2, 3]
fibs = [...fibs, 5, 8]
let more_fibs: []i8 = [13, 21]
fibs = [...fibs, ...more_fibs]
```

Arrays can be initialized with a repeat expression. `[v; n]` is dynamic and `n` may be any
integer; `#[v; n]` is fixed, so `n` must be a compile-time constant:
```lyra
struct Vec3 { x: i64, y: i64, z: i64 }

let zeros = [0; 16] // 16 zeros, on the heap
let points = #[Vec3 { x: 0, y: 0, z: 0 }; 100] // 100 points at (0, 0, 0), inline
```

## Array Comprehensions
Array comprehensions are a concise way to create arrays from existing arrays or ranges:
```lyra
let squares = [ x in 1..<=5 | x * x ]
// squares == [1, 4, 9, 16, 25]
```

They can include guards to filter elements:
```lyra
let even_squares = [ x in 1..<=10 | x % 2 == 0 | x * x ]
// even_squares == [4, 16, 36, 64, 100]

// Multiple generators and guards
let foo = [ x in 1..<=5, y in 1..<=5 | x % 2 != 0, y % 2 == 0 | (x, y, x * y) ]
// foo == [(1, 2, 2), (1, 4, 4), (3, 2, 6), (3, 4, 12), (5, 2, 10), (5, 4, 20)]
```
