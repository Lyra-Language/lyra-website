---
title: Maybe and Result
description: How Lyra handles missing values and failures — Maybe, Result, ?, ??, ?. and panics.
---

Lyra has no `null` and no exceptions. A function that might have nothing to give back says
so in its return type with `Maybe`. A function that might fail says so with `Result`.
Either way, the caller can't forget to handle it, because the compiler checks that every
case is covered.

## `Maybe`

`Maybe<t>` is either `Some(value)` or `None`:

```lyra
let find_index = pure (words: []string, target: string) -> Maybe<i64> => {
  for i, w in words {
    if w == target { return Some(i) }
  }
  None
}

let main = () -> void => {
  let words = ["red", "green", "blue"]
  match find_index(words, "green") {
    Some(i) => println("found at ${i}"),
    None => println("not there"),
  }
}
```

A `match` always works, but you'll usually reach for something shorter:

```lyra
let main = () -> void => {
  let found = "42".parse_i64()               // a Maybe<i64>

  println(found ?? 0)                        // the value, or 0 if there's none
  println(found.unwrap_or(0))                // the same, as a method
  println(found.map((n) => n * 2) ?? 0)      // change the value if there is one
  println(found.is_some())                   // true

  if let Some(n) = found { println("got ${n}") }
}
```

### Reaching through a `Maybe`

`?.` reads a field or calls a method only when there's a value. Otherwise the whole thing is
`None`. Combined with `??` it handles a chain of things that might be missing:

```lyra
struct Pet { name: string }
struct Person { name: string, pet: Maybe<Pet> }

let pet_name = pure (p: Person) -> string => p.pet?.name ?? "no pet"

let main = () -> void => {
  println(pet_name(Person { name: "Ada", pet: Some(Pet { name: "Rex" }) })) // Rex
  println(pet_name(Person { name: "Bob", pet: None })) // no pet
}
```

## `Result`

`Result<t, e>` is either `Ok(value)` or `Err(error)`. The error can be any type: a
string, or better, a `data` type that lists the ways things can go wrong:

```lyra
data PortError = Empty | NotANumber(string) | OutOfRange(i64)

let parse_port = pure (text: string) -> Result<i64, PortError> => {
  if text.len() == 0 { return Err(Empty) }
  let Some(n) = text.parse_i64() else { return Err(NotANumber(text)) }
  if n < 1 || n > 65535 { return Err(OutOfRange(n)) }
  Ok(n)
}

let main = () -> void => {
  for input in ["8080", "", "http", "99999"] {
    match parse_port(input) {
      Ok(port) => println("port ${port}"),
      Err(Empty) => println("no port given"),
      Err(NotANumber(t)) => println("'${t}' is not a number"),
      Err(OutOfRange(n)) => println("${n} is out of range"),
    }
  }
}
```

### Passing failures up with `?`

Most code that hits an error just wants to hand it back to its caller. `?` after an
expression does exactly that. On `Ok(v)` it gives you `v`, and on `Err(e)` it returns
`Err(e)` from the current function straight away:

```lyra
let parse_pair = pure (a: string, b: string) -> Result<(i64, i64), string> => {
  let x = a.parse_i64().ok_or("first value is not a number")?
  let y = b.parse_i64().ok_or("second value is not a number")?
  Ok((x, y))
}
```

`ok_or` turns a `Maybe` into a `Result` by supplying the error for the `None` case. `?`
works on a `Maybe` too, inside a function that returns a `Maybe`.

When the error types differ, `?` converts them through a `From` implementation, if you've
written one (see [Traits](/learn/traits/)):

```lyra
data AppError = BadInput(string)

impl From<string> for AppError {
  from = pure (msg) => BadInput(msg)
}

let check = pure (n: i64) -> Result<i64, string> => if n > 0 { Ok(n) } else { Err("not positive") }

let run = pure (n: i64) -> Result<i64, AppError> => {
  let v = check(n)?          // a string error, turned into an AppError
  Ok(v * 2)
}
```

### Writing `Ok` and `Err`

A `Result` needs both of its types settled. In `return Ok(5)` from a function declared
`-> Result<i64, string>`, the return type settles them. On its own, `let r = Ok(5)` doesn't
say what the error type is, and the compiler asks you to annotate it:
`let r: Result<i64, string> = Ok(5)`.

## When something is truly wrong: `panic`

Some failures aren't something the caller can handle: a broken assumption, or a bug.
`panic("message")` stops the program with that message. `expect` is the `Maybe` version:
it gives you the value, or panics with your message if there is none:

```lyra
let main = () -> void => {
  let limit = "250".parse_i64().expect("the limit is written in the source as digits")
  println(limit)
}
```

Use `Maybe` and `Result` for things that can go wrong in normal use, such as bad input, a
missing file or a full disk. Save `panic` for "this should be impossible". Integer
overflow and an out-of-bounds index are panics too.

Next: [Traits and Generics](/learn/traits/).
