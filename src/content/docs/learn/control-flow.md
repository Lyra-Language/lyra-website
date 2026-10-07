---
title: Control Flow
description: if as an expression, the for loop in all its forms, match and patterns, if let and let … else.
---

## `if` is an expression

`if` works as you'd expect, with no parentheses needed around the condition and braces
always required around the branches:

```lyra
let report = (temperature: i64) -> void => {
  if temperature > 30 {
    println("hot")
  } else if temperature < 10 {
    println("cold")
  } else {
    println("pleasant")
  }
}
```

It also **produces a value**, so it takes the place of the `? :` operator found in other
languages:

```lyra
let sign = pure (n: i64) -> string => if n < 0 { "negative" } else { "not negative" }
```

When `if` is used as a value, both branches must give the same type, and the `else` is
required.

## `for` is the only loop

There's no `while` keyword. `for` covers every kind of loop:

```lyra
let main = () -> void => {
  // Forever, until a `break`
  var tries = 0
  for {
    tries += 1
    if tries == 3 { break }
  }

  // While a condition holds
  var n = 10
  for n > 0 { n -= 3 }

  // C style: start; condition; step
  for var i = 0; i < 3; i += 1 { print(i) }
  println("")

  // Over a range, an array or a string
  for i in 0..<3 { print(i) }
  println("")
}
```

### Ranges

A range always spells out its direction and whether it includes its end:

| Range | Counts | Values |
|---|---|---|
| `0..<5` | up, end excluded | 0 1 2 3 4 |
| `0..<=5` | up, end included | 0 1 2 3 4 5 |
| `5..>0` | down, end excluded | 5 4 3 2 1 |
| `5..>=0` | down, end included | 5 4 3 2 1 0 |
| `0..<10:3` | up, in steps of 3 | 0 3 6 9 |

The arrow says which way it goes. `5..<1` is not "count down". It's an empty range,
because it counts up from 5 and is already past 1.

### Looping over arrays and strings

`for x in xs` visits each element. Add a second name to get the position too:

```lyra
let main = () -> void => {
  let fruit = ["apple", "banana", "cherry"]
  for i, name in fruit {
    println("${i + 1}. ${name}")
  }
}
```

### `break`, `continue` and labels

`break` leaves the loop and `continue` skips to the next pass. To break out of an *outer*
loop from inside an inner one, put a label on the outer loop:

```lyra
let main = () -> void => {
  search: for row in 0..<10 {
    for col in 0..<10 {
      if row * col == 42 {
        println("found at ${row}, ${col}")
        break search
      }
    }
  }
}
```

## `match`

`match` compares a value against a list of **patterns** and runs the first one that fits.
Like `if`, it produces a value:

```lyra
let describe = pure (n: i64) -> string => match n {
  0 => "zero",
  1 | 2 | 3 => "a few",
  4..<=9 => "single digit",
  x if x < 0 => "negative",
  _ => "lots",
}
```

Each arm is `pattern => result`, and the arms are separated by commas. Patterns can be:

| Pattern | Matches |
|---|---|
| `0`, `"quit"`, `'x'`, `true` | that exact value |
| `1 \| 2 \| 3` | any of the alternatives |
| `4..<=9` | anything in the range |
| `x` | anything, and binds it to the name `x` |
| `_` | anything, and binds nothing |
| `x if x < 0` | anything that also passes the guard |
| `big @ 100..<1000` | the range, and binds the value to `big` |
| `(a, 0)` | a tuple, piece by piece |
| `[]`, `[only]`, `[head, ...rest]` | an array, by shape |
| `Point { x, y }` | a struct, binding its fields |
| `Some(v)`, `Err(e)`, `Red` | one case of a `data` type, and its contents |

**A `match` must cover every possibility.** If you leave a case out, it's a compile error
that names the missing case. That's useful when you add a case to a type later: the
compiler finds every `match` that needs updating.

A comparison makes a good example. `<=>` gives an `Ordering`, which is `Less`, `Equal` or
`Greater`:

```lyra
let verdict = pure (guess: i64, secret: i64) -> string => match guess <=> secret {
  Less => "too low",
  Greater => "too high",
  Equal => "you got it",
}
```

An arm can run a block of statements instead of a single expression:

```lyra
let main = () -> void => {
  let words = ["hello", "", "world"]
  for word in words {
    match word.len() {
      0 => {
        println("(blank)")
        continue
      },
      n => println("${word} has ${n} letters"),
    }
  }
}
```

## `if let` and `let … else`

When you care about only one pattern, a whole `match` is more than you need. `if let` runs
its block only when the pattern matches:

```lyra
let main = () -> void => {
  let input = "42"
  if let Some(n) = input.parse_i64() {
    println("doubled: ${n * 2}")
  } else {
    println("not a number")
  }
}
```

`let … else` goes the other way. It binds the pattern for the **rest of the block**, and
the `else` block, which must leave (`return`, `break`, `continue` or a panic), handles the
case where the pattern doesn't match. It keeps the main path of a function unindented:

```lyra
let parse_age = pure (text: string) -> string => {
  let Some(age) = text.parse_i64() else { return "not a number" }
  if age < 0 { return "can't be negative" }
  "age ${age}"
}
```

A plain `let` also takes a pattern, as long as it can't fail. That's how you take a tuple
apart:

```lyra
let main = () -> void => {
  let point = (3, 4)
  let (x, y) = point
  println(x + y)
}
```

Next: [Structs and Data Types](/learn/structs/).
