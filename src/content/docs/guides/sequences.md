---
title: Sequences
description: Lazy sequences — gen functions, yield, the Seq type, and the combinators over it.
---

A sequence is a series of values produced one at a time, on demand. Where an array holds
every element at once, a sequence holds a computation and asks it for the next element
when someone wants one — so a sequence can be infinite, a chain of transformations over
it runs as one loop, and nothing is stored that nobody reads.

## Writing one

A `gen` function yields its elements instead of returning a value. Its type is `Seq<t>`,
and the annotation is required: the body's value says nothing about what it yields.

```lyra
let naturals = pure gen () -> Seq<i64> => {
  var n = 0
  for {
    yield n
    n += 1
  }
}
```

`yield e` hands `e` to whoever is walking the sequence and continues when they ask for
more; it has no value of its own. A `gen` body returns by finishing — a bare `return`
ends the sequence early — and `yield from s` yields every element of another sequence in
turn.

```lyra
let small = pure gen () -> Seq<i64> => { yield 1; yield 2 }
let both = pure gen () -> Seq<i64> => {
  yield from small()
  yield 10
  yield from small()
}
```

## Walking one

Two things consume a sequence directly: a `for-in` loop, and an array comprehension. The
loop allocates nothing; the brackets are where an array comes into being.

```lyra
let naturals = pure gen () -> Seq<i64> => {
  var n = 0
  for { yield n; n += 1 }
}

let main = () -> void => {
  for n in naturals().take(3) { println(n) }
  let first_five = [n in naturals().take(5) | n]
  println(first_five.join(" "))
}
```

Everything else in the prelude is written over those two. `map`, `filter`, `take`,
`take_while` and `zip` are `gen` functions that walk their input and yield; `sum`,
`count`, `first` and `to_array` walk it and answer.

```lyra
let naturals = pure gen () -> Seq<i64> => {
  var n = 0
  for { yield n; n += 1 }
}
let is_prime = pure noalloc (n: i64) -> bool => {
  if n < 2 { return false }
  var d = 2
  for d * d <= n {
    if n % d == 0 { return false }
    d += 1
  }
  true
}

let main = () -> void => {
  let ten_primes = [p in naturals().filter(is_prime).take(10) | p]
  let total = naturals().filter(is_prime).take(100).sum()
  let below_twenty = naturals().take_while((n) => n < 20).filter(is_prime).count()
  let above = naturals().filter((n) => n > 1000).filter(is_prime).first().unwrap_or(-1)
  println("${ten_primes.join(" ")} / ${total} / ${below_twenty} / ${above}")
}
```

An array enters the lazy world through `seq()`. The eager `map` and `filter` on arrays
are unchanged: `xs.map(f)` builds an array and runs `f` now, `xs.seq().map(f)` builds
nothing and runs `f` as the consumer asks.

```lyra
let main = () -> void => {
  let squares: []i64 = [1, 2, 3, 4].map((n) => n * n)
  for odd in squares.seq().filter((n) => n % 2 == 1) { println(odd) }
}
```

## How a chain runs

A chain consumed where it is written — `for x in naturals().filter(p).take(n)` — is
compiled into a single loop: the producer's body is placed at the consumer, and each
`yield` runs the consumer's body. Nothing represents the sequence, so the chain costs
what the hand-written loop would, and a `break` in the consumer ends the whole chain.

That has one consequence worth knowing. A function passed to `map` or `filter` runs
when the consumer asks, not when the chain is written: an unwalked chain runs it zero
times, and `map(g).filter(p)` runs `g` and `p` alternately rather than all of one and
then all of the other. `seq()` in the source is how the reader knows.

## Holding one

A sequence can also be held — bound with `let`, passed to a function, kept in a struct.
Held, it is a *cursor* over a suspended computation. `next()` steps it, answering
`Some` of the next element or `None` once it is done; a copy of the value shares the
cursor; and a walk over a held sequence continues from wherever it was left.

```lyra
let naturals = pure gen () -> Seq<i64> => {
  var n = 0
  for { yield n; n += 1 }
}

let main = () -> void => {
  var evens = naturals().filter((n) => n % 2 == 0)
  let one = evens.next().unwrap_or(-1)     // 0
  let two = evens.next().unwrap_or(-1)     // 2
  let rest = [x in evens.take(3) | x]      // [4, 6, 8]
  println("${one} ${two} ${rest.join(" ")}")
}
```

`next()` mutates the cursor, so the binding must be `var`, as it must for `push` on an
array. It is what `zip` is written over: the first sequence is walked, and the second is
stepped alongside it.

```lyra
let naturals = pure gen () -> Seq<i64> => {
  var n = 0
  for { yield n; n += 1 }
}
let fib = pure gen () -> Seq<i64> => {
  var a = 0
  var b = 1
  for {
    yield a
    let after = a + b
    a = b
    b = after
  }
}

let main = () -> void => {
  for (i, f) in naturals().zip(fib()).take(10) { println("F${i} = ${f}") }
}
```

Two cursors driven by hand are how a merge is written, since a walk over one sequence
can never see the other's head:

```lyra
let merge = pure gen (a: Seq<i64>, b: Seq<i64>) -> Seq<i64> => {
  var xs = a
  var ys = b
  var x = xs.next()
  var y = ys.next()
  for {
    match (x, y) {
      (None, None) => { break },
      (Some(v), None) => { yield v; x = xs.next() },
      (None, Some(w)) => { yield w; y = ys.next() },
      (Some(v), Some(w)) => {
        if v <= w { yield v; x = xs.next() } else { yield w; y = ys.next() }
      },
    }
  }
}
```

A held sequence needs a C compiler that can split coroutines — clang 15 or later; `lyrac`
says so by name if yours cannot.

## Three rules

- **Every stage of a chain is `Seq<t>`.** Nothing of the chain is recorded in the type, so
  a function may take `(s: Seq<i64>)` and be handed any chain at all.
- **A `gen` function says `-> Seq<t>`** and yields values of `t`. `yield from 0..<3`
  needs parentheses around the range for now.
- **Brackets materialize.** There is no `collect`: `[x in s | x]` is how a sequence
  becomes an array, and `to_array` is that spelled as a name.

The examples `examples/primes.lyra` and `examples/sequences.lyra` in the compiler's
repository walk through all of it.
