---
title: Tuple Types
description: Here is the description
---

Tuples look like this:

```lyra
// Declaration
tuple Point2D(f64, f64)

// Instantiation
let origin = Point2D(0.0, 0.0)

// Default parameters can be set
tuple RGBA(u8, u8, u8, f32 = 1.0)
let red = RGBA(255, 0, 0)
let transparentRed = RGBA(255, 0, 0, 0.5)
```
