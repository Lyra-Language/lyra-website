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

// Generic parameters can be used
tuple Point3D<t>(t, t, t)
let point_f64 = Point3D<f64>(3.2, 4.9, 9.2)
let point_u32 = Point3D<u32>(42, 32, 61)
let point_i32 = Point3D(1, 2, 3) // Inferred type is Point3D<i32>
```
