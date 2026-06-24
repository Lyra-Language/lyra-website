---
title: Array Types
description: Here is the description
---

Static array's type is `[N]T` where `N` is the number of elements and `T` is the element type.
For example:

```lyra
let fibs: [4]i8 = [1, 1, 2, 3]
let first = fibs[0] // arrays are zero-indexed
let last = fibs[-1] // negative indices count from the end
```

Dynamic array's type is `[]T` where `T` is the element type.
For example:

```lyra
let fibs: []i8 = [1, 1, 2, 3]
// Dynamic arrays support push
fibs.push(5)
```

Array elements can be inserted into another array literal with spread syntax:
```lyra
var fibs: []i8 = [1, 1, 2, 3]
fibs = [...fibs, 5, 8]
let more_fibs: []i8 = [13, 21]
fibs = [...fibs, ...more_fibs]
```

Arrays can be initialized with a repeat expression:
```lyra
let zeros = [0; 16] // 16 zeros
let points = [Vec3 { x: 0, y: 0, z: 0 }; 100] // 100 points at (0, 0, 0)

```

## Array Comprehensions
Array comprehensions are a concise way to create arrays from existing arrays or ranges:
```lyra
let squares = [ x in 1..=5 | x * x ]
// squares == [1, 4, 9, 16, 25]
```

They can include guards to filter elements:
```lyra
let even_squares = [ x in 1..=10 | x % 2 == 0 | x * x ]
// even_squares == [4, 16, 36, 64, 100]

// Multiple generators and guards
let foo = [ x in 1..=5, y in 1..=5 | x % 2 != 0, y % 2 == 0 | (x, y, x * y) ]
// foo == [(1, 2, 2), (1, 4, 4), (3, 2, 6), (3, 4, 12), (5, 2, 10), (5, 4, 20)]
```
