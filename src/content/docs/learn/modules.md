---
title: Modules
description: Splitting a program across files, pub, the forms of import, the prelude, and documentation comments.
---

## A file is a module

Every `.lyra` file is a module, named after its path. A file `geometry.lyra` next to your
program is the module `geometry`. A file `shapes/circle.lyra` is `shapes.circle`. Nothing
needs registering. Importing a module is enough for the compiler to find it.

Declarations are **private to their file** unless marked `pub`:

```lyra
//! Shapes and their measurements.

/// A circle, by its radius.
pub struct Circle { radius: f64 }

/// The area of `c`.
pub let area = pure (self: Circle) -> f64 => PI_ISH * self.radius * self.radius

// Not `pub`: only this file can use it.
const PI_ISH = 3.14159
```

## Importing

There are two forms, and you can use both in one file:

<!-- lyra:no-check -->
```lyra
import geometry                  // geometry.area, geometry.Circle, …
import geometry.{ Circle, area } // bare Circle and area

let main = () -> void => {
  let c = Circle { radius: 2.0 }
  println(area(c))
  println(geometry.area(c))
  println(c.area())
}
```

- `import geometry` brings in the **module name**: you write `geometry.area(…)`. It's
  always clear where a name came from.
- `import geometry.{ … }` brings in **only the names listed**, without a prefix.
- `import geometry.{ area as circle_area }` renames one on the way in.

A method call like `c.area()` doesn't need the name `area` imported. It's found from the
type of `c`, as long as the module is imported in some form.

The standard library is imported the same way:

```lyra
import std.io.{ read_file }
import std.collections.{ HashMap, hashmap_new }

let main = () -> void => {
  var ages: HashMap<string, i64> = hashmap_new()
  ages.insert("Ada", 36)
  println(ages.get("Ada") ?? 0)
  println(read_file("missing.txt").is_some())
}
```

## The prelude

Some things are available without any import: `println`, `Maybe`, `Result`, `Ordering`,
the string and array methods, `Show`, `Ord` and the rest of `std.prelude`. The
[prelude reference](/reference/std-prelude/) lists everything in it. Anything else, such as
files, `HashMap`, JSON or dates, is imported from `std`.

If you declare something with the same name as a prelude function (`count`, `sum`, `map`,
`take`, …), the compiler warns, because inside your file the prelude's version is now out
of reach. Pick another name.

## Documentation comments

`///` documents the declaration directly below it, and `//!` documents the whole module.
Both are Markdown. They show up when you hover in the editor, and `lyrac doc` turns them
into web pages. The [prelude reference](/reference/std-prelude/) on this site is generated
that way.

```lyra
/// Splits `total` into `parts` shares that differ by at most one.
///
/// # Examples
///
/// `shares(10, 3)` is `[4, 3, 3]`, and `shares(10, 0)` is `[]`.
pub let shares = pure (total: i64, parts: i64) -> []i64 =>
  [i in 0..<parts | total / parts + (if i < total % parts { 1 } else { 0 })]
```

The headings `# Examples`, `# Panics` and `# Errors` are recognised. The comment must
touch the declaration: a blank line in between detaches it, and the compiler warns.

Next: [Reading Lyra: a cheat sheet](/learn/cheat-sheet/).
