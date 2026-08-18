---
title: Data Types
description: Sum types — enums, payloads, and constructing and matching values of them.
---

A `data` type is a **sum type**: a value is exactly one of its constructors. The simplest
shape is a plain enum.

```lyra
data ColorName = Red | Green | Blue
let color: ColorName = Green
```

A constructor can carry a payload, and the type can take generic parameters.

```lyra
data Slot<t> = Vacant | Filled t
let slot_int: Slot<i32> = Filled 42
let slot_str: Slot<string> = Vacant
```

The prelude's `Maybe<t>` has exactly this shape — `None | Some t` — so it is an ordinary
`data` type and not something the compiler builds in. Declare your own type named `Maybe`
and it shadows the prelude's, which warns (`lyra-W012`) and leaves `?` reporting that your
`Maybe` is not the one it knows. Use the one you already have.

## Constructing values

A constructor with a payload is applied by **juxtaposition** — the constructor name followed
by its value, with no parentheses.

```lyra
let x = 7
let a = Some 42
let b = Ok "loaded"
let c = Some -1
let d = Some x
```

`Some -1` is `Some` applied to `-1`, not `Some` minus one. A constructor name is always
PascalCase and a variable name is always lowercase, so there is no value on the left for a
subtraction to use — the reading is never ambiguous the way it is in some ML-family
languages.

Parentheses are still available and mean the same thing, so `Some(42)` and `Some 42` are the
same value. Use whichever reads better.

### When parentheses are required

A juxtaposed operand must be **atomic**: a literal, a name, another constructor, a negated
literal, or a struct or array literal. Anything compound — a call, a member access, an index,
arithmetic — is parenthesized.

```lyra
struct Point { x: i32 }
let point = Point { x: 2 }

let called = Some("ab".len())
let field = Some(point.x)
let sum = Some(1 + 2)
```

A constructor takes **one** operand, never a curried list. A constructor with several
positional fields therefore keeps its parentheses, because those parentheses belong to the
tuple payload rather than to a call.

```lyra
data Shape = Circle(f64) | Rect(f64, f64) | Empty
let r = Rect(3.0, 4.0)
let e = Empty
```

A constructor with no payload is just its bare name, as `Empty` and `Vacant` are above.

## Matching

Data types pair with the `match` expression, and patterns use the same juxtaposition.

```lyra
let describe = pure (m: Maybe<i32>) -> string => match m {
    None => "no value",
    Some n => "got ${n}",
}
```

Because a `data` type is a closed set of constructors, a `match` over one must cover every
case — a missing constructor is an error, not a warning, and the compiler names the ones you
left out.
