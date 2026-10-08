---
title: Structs and Data Types
description: The kinds of type you can declare — struct, data, tuple, type and alias — their methods, and how values are copied or shared.
---

Lyra has several ways to declare your own types:

| Declaration | What it is | Example |
|---|---|---|
| `struct` | Several named fields, all present at once: *this and that*. | `struct Point { x: f64, y: f64 }` |
| `data` | Exactly one of several cases: *this or that*. | `data Shape = Circle(f64) \| Dot` |
| `tuple` | Several fields known by position rather than by name. | `tuple Rgb(u8, u8, u8)` |
| `type` | A new type stored like an existing one, but kept apart from it. | `type Meters = f64` |
| `alias` | Another name for an existing type, fully interchangeable with it. | `alias Grid = [][]bool` |

`struct` and `data` are the ones you'll write most. Between them they cover nearly every
shape of data, and they're the focus of this page. The other three are shorter, and are
covered [near the end](#tuples). There is also `union`, which exists only for calling C
libraries.

## Structs

```lyra
struct Player {
  name: string,
  health: i64 = 100,
  level: i64 = 1,
}

let main = () -> void => {
  var hero = Player { name: "Robin" }       // health and level use their defaults
  hero.health -= 25
  println("${hero.name}: ${hero.health} hp, level ${hero.level}")
}
```

A struct literal names each field, and a field with a default can be left out. You reach a
field with a dot. You can only change a field if the value is held in a `var`.

### Copying with changes

`{ base | field: value }` makes a **copy** of `base` with some fields replaced. The
original is untouched:

```lyra
struct Settings {
  volume: i64,
  muted: bool,
}

let main = () -> void => {
  let normal = Settings { volume: 7, muted: false }
  let quiet = Settings { normal | muted: true }
  println("${normal.muted} ${quiet.muted} ${quiet.volume}")   // false true 7
}
```

### Methods on a struct

Methods are functions with a `self` parameter, as on the [Functions](/learn/functions/)
page. The usual way to write a type's methods is to group them in an **`impl` block**:

```lyra
struct Vec2 { x: f64, y: f64 }

impl Vec2 {
  let length = pure (self) -> f64 => (self.x * self.x + self.y * self.y).sqrt()

  let scaled = pure (self, by: f64) -> Vec2 => Vec2 { x: self.x * by, y: self.y * by }

  let scale = (self: mut, by: f64) => {
    self.x *= by
    self.y *= by
  }
}

let main = () -> void => {
  var v = Vec2 { x: 3.0, y: 4.0 }
  println(v.scaled(2.0).length())  // 10
  v.scale(3.0)
  println(v.length())              // 15
}
```

Inside the block, **`self` takes the block's type**, so you write `self` alone rather than
`self: Vec2`. To borrow the receiver instead of copying it, write the mode after the colon:
`self: mut` to change it (the caller needs a `var`, as with `v.scale` above), or
`self: ref` to read a large value without copying it.

**The block is shorthand and nothing more.** Each member is exactly the top-level function
you'd get by writing it outside the block with `self`'s type spelled out. This is the same
`length` as the one above, and code calling it can't tell which way it was written:

```lyra
struct Vec2 { x: f64, y: f64 }

let length = pure (self: Vec2) -> f64 => (self.x * self.x + self.y * self.y).sqrt()
```

So everything about methods carries over: `v.length()` and `length(v)` both work, `pub`
on a member exports it, and `///` documents it. You'll meet both forms in real code. The
standard library uses blocks, and its [reference page](/reference/std-prelude/) lists each
member as the function it stands for.

#### What goes in a block

A block holds methods, and only methods. Every member is a `let` whose function takes
`self` first. Anything else is refused with `lyra-E089`, and the message says what to do
instead:

- **A function without `self`**, such as a constructor, goes outside the block. There is
  no constructor syntax and no `new`; write an ordinary function, conventionally named
  after the type.
- **`var`, `const`, or a `let` that isn't a function** go at the top level of the file.
- **`self: Vec2`** is refused inside the block, because the block already says the type.
- **A block inside a function** is refused; blocks go at the top level of a file.

```lyra
struct Vec2 { x: f64, y: f64 }

// Builds a Vec2: no `self`, so it lives outside the block.
let vec2 = pure (x: f64, y: f64) -> Vec2 => Vec2 { x: x, y: y }

impl Vec2 {
  let dot = pure (self, other: Vec2) -> f64 => self.x * other.x + self.y * other.y
}
```

#### One name, many types

Two types can each have a method with the same name. The call picks the one whose `self`
type matches the value it's called on:

```lyra
struct Circle { radius: f64 }
struct Square { side: f64 }

impl Circle {
  let area = pure (self) -> f64 => 3.14159 * self.radius * self.radius
}

impl Square {
  let area = pure (self) -> f64 => self.side * self.side
}

let main = () -> void => {
  println(Circle { radius: 1.0 }.area())   // 3.14159
  println(Square { side: 3.0 }.area())     // 9
}
```

That's also how `len` works on both strings and arrays. Any type can have a block,
including the built-in ones:

```lyra
impl string {
  let shout = pure (self) -> string => self.to_ascii_upper() ++ "!"
}

let main = () -> void => {
  println("hello".shout())    // HELLO!
}
```

### Generic structs

A struct can take type parameters, written in angle brackets:

```lyra
struct Pair<a, b> {
  left: a,
  right: b,
}

let main = () -> void => {
  let p = Pair { left: 1, right: "one" }    // a Pair<i64, string>
  println("${p.left} is ${p.right}")
}
```

Methods on a generic type go in a block that names the type's parameters, `impl Pair<a, b>`.
The names are yours to choose, and every member can use them. A `where` on the block puts a
bound on them for every member at once, here so that both halves can be printed:

```lyra
struct Pair<a, b> {
  left: a,
  right: b,
}

impl Pair<a, b> {
  let swapped = pure (self) -> Pair<b, a> => Pair { left: self.right, right: self.left }
}

impl Pair<a, b> where a: Show, b: Show {
  let render = pure (self) -> string => "(${self.left}, ${self.right})"
}

let main = () -> void => {
  let p = Pair { left: 1, right: "one" }
  println(p.render())             // (1, one)
  println(p.swapped().render())   // (one, 1)
}
```

A type can have several blocks. That's how `swapped` works on every `Pair` while `render`
needs the [`Show` bound](/learn/traits/), which only some pairs meet.

## Data types

A `data` type lists its cases, separated by `|`. A case can carry values of its own:

```lyra
data Shape =
  Circle(f64)
  | Rect(f64, f64)
  | Point

let area = pure (s: Shape) -> f64 => match s {
  Circle(r) => 3.14159 * r * r,
  Rect(w, h) => w * h,
  Point => 0.0,
}

let main = () -> void => {
  let shapes = [Circle(1.0), Rect(2.0, 3.0), Point]
  for s in shapes { println(area(s)) }
}
```

You build a value by naming the case: `Circle(1.0)`, or just `Point` when the case carries
nothing. You take it apart with `match`. Because `match` must cover every case, adding a
`Triangle` to `Shape` turns each `match` that ignores it into a compile error. The
compiler gives you the list of places to update.

The simplest data type is an enumeration:

```lyra
data Direction = North | East | South | West
```

The standard library's most important types are ordinary `data` types: `Maybe<t>`
(`Some(value)` or `None`) and `Result<t, e>` (`Ok(value)` or `Err(error)`). They get
[their own page](/learn/errors/). The [Data Types guide](/guides/types/data/) goes further,
including the shorter `Some 42` form without parentheses.

## Tuples

A tuple groups a few values without naming them. It's handy for returning two things from
a function:

```lyra
let divide = pure (a: i64, b: i64) -> (i64, i64) => (a / b, a % b)

let main = () -> void => {
  let (quotient, remainder) = divide(17, 5)
  println("${quotient} r ${remainder}")
  let both = divide(9, 2)
  println(both.0)                    // positions are .0, .1, …
}
```

`tuple` gives a tuple shape a name of its own. You build one by calling the name, and read
its fields by position:

```lyra
tuple Rgb(u8, u8, u8)

let main = () -> void => {
  let orange = Rgb(255, 165, 0)
  println(orange.1)    // 165
}
```

Use a `struct` once the fields need names to be understood. `Rgb` gets away without them
because everyone knows the order. See the [Tuples guide](/guides/types/tuples/) for more.

## `type` and `alias`

Both name an existing type. The difference is whether the compiler keeps the new name
apart from the old one.

**`type`** makes a distinct type that's stored exactly like the original. A `Meters` is
an `f64` underneath, but you can't pass one where a `Seconds` or a plain `f64` is
expected. That turns a mixed-up unit into a compile error:

```lyra
type Meters = f64
type Seconds = f64

let speed = pure (d: Meters, t: Seconds) -> f64 => f64(d) / f64(t)

let main = () -> void => {
  let d = Meters(100.0)
  let t = Seconds(9.58)
  println(speed(d, t).to_fixed(2))   // 10.44
  // speed(t, d) is refused: cannot assign Seconds to Meters
}
```

You make one by calling its name, `Meters(100.0)`, and get the plain value back by calling
the original type, `f64(d)`. A `type` can also carry a range or a pattern that the
compiler checks. The [Nominal Types guide](/guides/types/nominal-types/) covers that.

**`alias`** is only a shorter name. A `Grid` *is* a `[][]bool`, and the two can be used for
each other anywhere. Use an alias to name a long type, not to keep values apart:

```lyra
alias Grid = [][]bool

let count_alive = pure (g: Grid) -> i64 => {
  var alive = 0
  for row in g {
    for cell in row {
      if cell { alive += 1 }
    }
  }
  alive
}

let main = () -> void => {
  let g: Grid = [[true, false], [false, true]]
  println(count_alive(g))    // 2
}
```

An alias can't take type parameters: `alias Table<k> = …` is not allowed.

If you've used TypeScript or Rust, note that their `type X = Y` is an alias. In Lyra it's
the distinct kind, so mixing the two up gets you a compile error rather than a silent
mistake.

## Copying and sharing

A struct, tuple or `data` value is **copied** when you assign it to another name or pass it
to a function. Changing the copy never changes the original:

```lyra
struct Counter { n: i64 }

let main = () -> void => {
  var a = Counter { n: 1 }
  var b = a          // a copy
  b.n = 99
  println(a.n)       // still 1
}
```

That's almost always what you want, and it means a function can't quietly change your
data. When two names really must see the *same* value, mark the type `shared` where you
store it. A shared value is reference-counted, and the second name gets the same object
rather than a copy:

```lyra
struct Counter { n: i64 }

let main = () -> void => {
  var a: shared Counter = Counter { n: 1 }
  var b: shared Counter = a     // the same object
  b.n = 99
  println(a.n)                  // 99
}
```

You'll also need `shared` for a type that contains itself, such as a tree node with a
child. Without it the type would have no fixed size.

Lyra has no garbage collector and no manual `free`. Memory is released when the last name
holding it goes away, so you won't see a destructor or a `delete` in Lyra code.

Next: [Maybe and Result](/learn/errors/).
