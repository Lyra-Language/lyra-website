---
title: Getting Started
description: Build the compiler, run your first program, and learn the three commands you will use every day.
---

This track teaches Lyra from the beginning: enough to read any Lyra program and to write
your own. It assumes you have programmed before in some other language, but not in Lyra.
Each page builds on the one before it, and every example on these pages is checked
against the real compiler whenever the site is built. If an example is here, it compiles.

## Installing

Lyra is built from source. You need Go, a C compiler (clang or gcc) and Git. The
[workspace README](https://github.com/Lyra-Language/lyra-workspace) lists exact versions
for each operating system.

```bash
git clone https://github.com/Lyra-Language/lyra-workspace.git
cd lyra-workspace
./setup.sh --https
cd lyra
./build.sh
```

`build.sh` leaves the compiler at `lyra/build/lyrac` and the language server at
`lyra/build/lyra-lsp`. Put `lyra/build` on your `PATH` so you can type `lyrac` from
anywhere.

## Hello, world

Save this as `hello.lyra`:

```lyra
let main = () -> void => {
  println("Hello, world!")
}
```

Then run it:

```bash
lyrac run hello.lyra
```

That one line already shows the pattern of the whole language: **everything is a binding.**
A function is a value, written `(parameters) -> return type => body`, and `let main = …`
gives that value a name. `main` is where the program starts.

## The three commands

| Command | What it does |
|---|---|
| `lyrac check file.lyra` | Parses and type-checks the file and prints any errors and warnings. Fast; nothing is built. |
| `lyrac run file.lyra` | Checks, compiles and runs the program. `lyrac run file.lyra -- a b` passes `a b` to the program. |
| `lyrac build file.lyra` | Compiles a native executable next to the source file (`-o` to name it). |

`lyrac run --watch file.lyra` rebuilds and restarts the program whenever you save. It is
the quickest way to experiment.

## Reading the compiler's messages

Diagnostics look like this:

```
hello.lyra:2:3: error [lyra-E007]: pure function calls impure function "println"
hello.lyra:5:5: warning [lyra-W018]: "area" has no observable effect; mark it `pure`. …
```

The format is file, line and column, then the severity, then a code. **Errors** (`lyra-E…`)
stop the build. **Warnings** (`lyra-W…`) do not, but they almost always point at something
worth fixing. Lyra's messages try to say what to do, not only what went wrong, so read
past the first clause.

## Editor support

Both editors get errors as you type, hover information and Format Document. All of it
comes from `lyra-lsp`, so build it first with `./build.sh`.

- **VS Code** — install the extension from `lyra-vscode-ext/` in the workspace. If
  `lyra-lsp` isn't on your `PATH`, set `lyra.languageServerPath` to `lyra/build/lyra-lsp`.
- **Zed** — use *Install Dev Extension* and pick `lyra-zed-ext/`.

## A first real program

Here is a slightly bigger program to read before moving on. Don't worry if parts of it are
unfamiliar; the next pages cover each piece.

```lyra
/// One line of a shopping list.
struct Item {
  name: string,
  price: f64,
  quantity: i64 = 1,
}

/// What `item` costs in total.
let cost = pure (item: Item) -> f64 => item.price * f64(item.quantity)

let main = () -> void => {
  let basket = [
    Item { name: "apples", price: 0.5, quantity: 6 },
    Item { name: "bread", price: 2.25 },
  ]

  var bill = 0.0
  for item in basket {
    println("${item.name}: ${cost(item).to_fixed(2)}")
    bill += cost(item)
  }
  println("total: ${bill.to_fixed(2)}")
}
```

A few things to notice:

- `struct Item { … }` declares a record type, and a field can have a default (`quantity`).
- `let` makes a binding that never changes; `var` makes one you can reassign (`bill += …`).
- `pure` on `cost` promises that the function only computes its result. It prints nothing
  and changes nothing outside itself, and the compiler checks the promise.
- `"${…}"` puts the value of any expression into a string.
- `///` is a documentation comment. It attaches to the declaration right below it and shows
  up when you hover over that name in your editor.

Next: [Values and Bindings](/learn/basics/).
