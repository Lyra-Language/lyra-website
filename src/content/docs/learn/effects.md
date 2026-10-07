---
title: "Effects: pure, det and noalloc"
description: What the words in front of a function promise, how the compiler checks them, and why the warning to add pure keeps appearing.
---

Many Lyra functions start with a word or two before their parameters:

```lyra
let add = pure (a: i64, b: i64) -> i64 => a + b
let biggest = pure noalloc (a: i64, b: i64) -> i64 => a.max(b)
```

These are **effect bounds**. Each one promises that the function does *not* do certain
things, and the compiler checks the promise all the way down: through every function it
calls, and every function those call.

## The three bounds

| Bound | Promises the function does not… | So a caller knows… |
|---|---|---|
| `pure` | read input, write output, use the clock or randomness, or change anything outside itself | the result depends only on the arguments, and calling it changes nothing else |
| `det` | read input, the clock or randomness | the same arguments always give the same result (printing is allowed) |
| `noalloc` | allocate memory on the heap | it's safe in a tight loop, a game frame, or a console with no heap |

They combine: `pure noalloc` is common in the standard library.

`pure` doesn't forbid *local* changes. A `pure` function can have `var`s, loops and arrays it
pushes into, because nobody outside can see them. What it can't do is change something
the caller can see, such as a `mut` parameter.

```lyra
let squares_up_to = pure (n: i64) -> []i64 => {
  var out: []i64 = []
  for i in 1..<=n { out.push(i * i) }    // a local array: invisible to the caller
  out
}
```

## What breaking a promise looks like

<!-- lyra:no-check -->
```lyra
let shout = pure (s: string) -> string => {
  println(s)          // error: pure function calls impure function "println"
  s.to_ascii_upper()
}
```

The error is reported **at the line that breaks the promise**, not at some distant caller.
That's the point of writing the bound. Without it, adding a `println` deep inside a helper
would be reported at whichever `pure` function three calls up happened to use it.

## Why the compiler suggests `pure`

The compiler works out every function's effects whether you write a bound or not. When it
finds a top-level function that has no effects but isn't marked `pure`, it warns
(`lyra-W018`) and suggests adding it. Nothing is refused: the warning is there so that
when someone later adds an effect, the error lands at their edit.

As a rule of thumb: **if a function only computes its result, mark it `pure`.** `main`
never needs a bound, and neither does a lambda written inline.

## Effects and the program's edges

A well-shaped Lyra program keeps its effects at the edges. `main` and a few functions near
it read input, print and talk to the operating system. Everything they call is `pure`
and works only on the values it's given:

```lyra
let main = () -> void => {
  let line = read_line() ?? ""          // effect: reads input
  let summary = summarize(line)         // pure: just computes
  println(summary)                      // effect: writes output
}

let summarize = pure (line: string) -> string => {
  let words = line.split(" ").filter((w) => w.len() > 0)
  "${words.len()} words, ${line.len()} characters"
}
```

Code shaped like this is easy to test and to reason about, since a pure function can only
answer from its arguments. When a function needs the time or a random number, pass it in
as a parameter rather than reading it inside.

Next: [Modules](/learn/modules/).
