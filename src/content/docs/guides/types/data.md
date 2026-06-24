---
title: Data Types
description: Here is the description
---

Data types can be used like basic enums:
```lyra
data ColorName = Red | Green | Blue
let color: ColorName = Green
```

They can also have generic parameters and contain fields:
```lyra
data Maybe<t> = Nil | Some t
let maybe_int: Maybe<i32> = Some 42
let maybe_str: Maybe<string> = Nil
```

Data types pair nicely with the match expression:
```lyra
match maybe_int {
    Nil => println("No value")
    Some n => println("Some value: ${n}")
}
```
