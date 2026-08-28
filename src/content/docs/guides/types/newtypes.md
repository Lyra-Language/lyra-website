---
title: Newtypes
description: Nominal identity for a structural type — units the compiler enforces, with constraints checked at compile time and at run time.
---

A `newtype` gives **nominal identity** to a structural type: `Meters` is not
interchangeable with other `i64`s, even though it is one at run time.

```lyra
newtype Meters = i64
newtype Feet = i64

let walk = (d: Meters) -> Meters => d
```

The base must actually be structural — scalars, `string`, arrays, raw pointers and
function types all work. A `struct`, a `data` type or a tuple is refused
(`lyra-E041`): those already have identity, so there is nothing for a newtype to add.

## Constructing and converting

A newtype has a constructor, and it is an assertion rather than a wrapper: `Meters(x)`
lowers to its operand and nothing else. An **untyped literal** converts implicitly — it
has no unit yet — and a **typed value** does not (`lyra-E046`): it came from somewhere,
and silently relabeling it is the unit mix-up the feature exists to prevent.

```lyra
let m: Meters = 100        // an untyped literal converts implicitly
let f: Feet = Feet(30)     // the constructor asserts the type
```

So `walk(m)` compiles and `walk(f)` does not — and passing a plain `i64` variable where
a `Meters` is expected writes `Meters(x)`, saying the unit out loud at the one place it
is claimed.

A **construction written in place** is treated like a literal, whatever its parts: an
array literal or repeat — elements computed or not — and a lambda literal all convert
implicitly, because the container the newtype names is built right there, aimed at the
annotation. A typed *binding* holding one still needs the constructor.

```lyra
newtype Row = []i64
let r: Row = [1, 2, 3]
```

## Reading the value back out

Reading out is explicit in every direction the conversion is: apply the **base's name**
where it has one, and the universal **`base(...)`** where it does not (an array, a raw
pointer, a function type). Both are identities at run time, exactly like the
constructor.

```lyra
let sum = i64(m) + i64(f)      // a nameable base uses its name
let plain: []i64 = base(r)     // an unnameable one uses base(...)
let first = base(r)[0]
```

`base(...)` strips exactly one newtype layer, so a chain reads out one declaration at a
time — matching the rule that newtype-to-newtype conversion has no path. Letting the
value flow implicitly into its base type is refused (`lyra-E047`), and the message
names whichever spelling applies.

## Constraints

A `where` clause constrains which base values the newtype admits. A provable violation
is a compile error; a value the compiler cannot see traps where it is constructed — the
same ladder the rest of the language uses.

```lyra
newtype Percent = u8 where range(0..<=100)
newtype Hex = string where pattern(r"^#[0-9a-fA-F]{6}$")

let p: Percent = 85
let bg: Hex = "#1e2127"
```

`range(...)`, `values(...)` and `step(...)` constrain numbers; `pattern(...)` constrains
strings and is compiled to a [table-driven matcher](/guides/regex/) at compile time, so
the runtime needs no regex engine. The checks follow the type wherever it flows — an
annotation, an argument, a return, an array element — not just the declaration site.

## Transparency

A newtype supports its base's **methods** (`n.len()` on a `newtype Name = string`),
its base's **indexing** (`r[0]` on a `Row`), and — for a function-type base — its
base's **calls**. A newtype over a function type is nominal *and* callable:

```lyra
newtype Handler = (i64) -> i64

let describe = (f: Handler) -> i64 => f(20)
let h: Handler = (n) => n + 1     // the annotation wins; parameters come from the base
let use = () -> i64 => h(1) + describe(h)
```

Two deliberate exceptions. The overflow-arithmetic family
(`wrapping_*`/`saturating_*`/`checked_*`) stops at the wrapper (`lyra-E043`): those are
the operators' escape hatches, and arithmetic on a newtype is opt-in — write an
`impl Add for Meters`, or convert to the base. And `println(m)` refuses rather than
printing the bare base: printing is where transparency would erase the name the newtype
carries, so give it an `impl Show`.
