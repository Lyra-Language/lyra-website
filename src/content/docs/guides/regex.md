---
title: Regular Expressions
description: One regex, everywhere — compiled at compile time to a linear-time matcher, with no engine in the runtime.
---

A regex in Lyra is a **literal**, written `r"…"`, and it means the same thing in every
position: a pattern compiled *at compile time* into a table-driven matcher. Matching is
O(n) in the input with no backtracking and no allocation — there is no regex engine in
the runtime, and there does not need to be, because a pattern is always known while
compiling. Only the tables and one shared driver ship in the compiled program.

Two positions consume those tables today.

## In a constraint

A `pattern(...)` constraint on a [newtype](/guides/types/newtypes/) admits only strings
the pattern accepts — checked at compile time for a literal, and by the compiled tables
at run time for a value the compiler cannot read:

```lyra
newtype Hex = string where pattern(r"^#[0-9a-fA-F]{6}$")
let bg: Hex = "#1e2127"
```

## In a match

A regex is a `match` pattern on a string scrutinee. Each arm is one call to the shared
matcher; a binding wrapper (`w @ r"…"`) binds the scrutinee exactly as it does on any
other arm.

```lyra
let classify = pure (s: string) -> string => match s {
  r"^#[0-9a-fA-F]{6}$" => "a color",
  r"^[0-9]+$" => "digits",
  w @ r"^[a-z]+$" => "lowercase, ${w.len()} runes",
  _ => "something else",
}
```

Regex arms never make a match exhaustive — even a set of patterns that covers every
string still wants a catch-all — and one pattern used in several places compiles to one
table. Matching is effect-free, so regex arms are fine in `pure` code:

```lyra
newtype Hex = string

let to_hex = pure (s: string) -> Maybe<Hex> => match s {
  r"^#[0-9a-fA-F]{6}$" => Some(Hex(s)),
  _ => None,
}
```

## What the subset is

Because every pattern becomes a finite table, a few constructs are refused at compile
time rather than supported slowly:

- a **lookbehind**, whose gate depends on text before the input (`lyra-E054`);
- a pattern whose table would be too large (`lyra-E054` names the limit);
- **lazy quantifiers** (`*?`, `+?`) — rewrite with a complemented class, which is what a
  lazy quantifier usually means anyway (`[^,]*` up to the next comma, rather than
  `.*?`).

These are properties of the language's regex, not of any one position: what a
constraint refuses, a match arm refuses identically, and the compile-time and run-time
answers for one pattern always agree. A regex as a first-class *value*
(`let re = r"[a-z]+"`) is not implemented yet (`lyra-E052`); when it is, it will be the
same literal-constructed, compile-time-compiled subset.
