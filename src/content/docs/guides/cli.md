---
title: Command-Line Programs
description: Arguments, files, standard input and exit codes — what a program needs to be run from a shell.
---

A program run from a shell reads its arguments, takes input from a file or a pipe, writes
its output somewhere, and answers with an exit code. Lyra has each of those, and only the
last is in the language: the rest are ordinary library code over the C library.

## Arguments

`program_args()` is the raw list, the program's own name first — the convention C set and
every language since has kept.

```lyra
let main = () -> void => {
  let args = program_args()
  println("running ${args[0]}")
  for i, arg in args {
    if i > 0 { println("  ${i}: ${arg}") }
  }
}
```

That is rarely what a program wants to read. `std.collections` sorts a command line into
the three kinds it actually carries — switches, valued options, and positional arguments:

```lyra
import std.collections.{ parse_args }

let main = () -> void => {
  let args = parse_args(["-o"])
  if args.has("-v") { println("verbose") }
  println("writing ${args.value("-o").unwrap_or("a.out")}")
  for path in args.positional { println("input: ${path}") }
}
```

**The caller says which flags take a value**, which is the argument to `parse_args`. It
has to: `-o out.bin` and `-v input.txt` are the same three tokens, and nothing in them
says whether `input.txt` belongs to `-v` or stands alone. A flag not on the list is a
switch, and the word after it is positional.

`has` answers a bool and `value` answers one `Maybe`. That is two questions rather than
one because a flag has three states — absent, present, present with a value — and a
single answer would be a `Maybe<Maybe<string>>`, which no caller wants to read. Asking
both is how a program catches a valued flag written last with nothing after it:

```lyra
import std.collections.{ parse_args }

let main = () -> u8 => {
  let args = parse_args(["-o"])
  if args.has("-o") && args.value("-o").is_none() {
    println("-o needs a value")
    return 2
  }
  0
}
```

`args.program` is what the shell ran, which is what a usage message should print rather
than a name compiled into the program.

## Reading

`std.io` reads a whole file as one string, or `None` when it cannot be opened — missing,
unreadable, a directory. `read_stdin()` is the same for a pipe, so a program can take
either without the rest of it knowing which.

```lyra
import std.collections.{ parse_args }
import std.io.{ read_file, read_stdin }

let main = () -> u8 => {
  let args = parse_args(["-f"])
  let text = match args.value("-f") {
    Some(path) => match read_file(path) {
      Some(contents) => contents,
      None => {
        println("cannot read ${path}")
        return 1
      },
    },
    None => read_stdin(),
  }
  println("${text.len()} characters")
  0
}
```

`None` rather than an error value, because the question a caller asks first is "did it
open", and the reason is what `errno` holds — reachable through an `extern` when a
program needs it. For a line at a time, `read_line()` is in the prelude and answers
`None` at end of input.

## Writing

`write_file` overwrites a file with a string, creating it if it does not exist, and
answers whether all of it landed.

```lyra
import std.io.{ write_file }

let main = () -> u8 => {
  if write_file("notes.txt", "one\ntwo\n") { 0 } else {
    println("cannot write notes.txt")
    1
  }
}
```

`false` means the path could not be opened for writing or the write was cut short — a
full disk, a broken pipe — and in the second case the file holds however much got
through, which is all any writer that does not write to a temporary and rename can
promise.

`append_file` adds a string to the end of a file instead, creating the file if it does not
exist, and answers the same way.

```lyra
import std.io.{ append_file }

let main = () -> void => {
  if !append_file("log.txt", "started\n") { println("cannot write log.txt") }
}
```

Every write lands at the end of the file, even when another process is appending to it
too.

## Exit codes

`main` may return `void` or `u8`, and the `u8` is the process's exit status. It is a
`u8` rather than a wider integer because the operating system truncates it to eight bits
regardless — even C's `return 300` exits 44 — so a wider type would only add a silent
surprise.

```lyra
let main = () -> u8 => {
  let args = program_args()
  if args.len() < 2 {
    println("usage: ${args[0]} FILE")
    return 2
  }
  0
}
```

By convention 0 is success, 1 is the program failing at what it was asked to do, and 2
is being asked wrongly — a usage error. Nothing enforces that; it is what a shell script
testing `$?` will expect.

## A worked example

`examples/todo.lyra` in the compiler's repository is all of the above in one program: a
to-do list stored as a text file.

```
todo add buy milk
todo list
todo done 1
todo remove 1
todo -f groceries.txt add eggs
```

The store is one task per line, `[ ] text` or `[x] text` — readable and editable without
the program, which is the point of a plain-text file. Parsing a line is three cases, and
the third is what makes hand editing safe: a line that is neither prefix is a task
somebody typed in, read as unfinished rather than refused.

```lyra
struct Task {
  done: bool,
  text: string,
}

let parse_line = pure (line: string) -> Task =>
  if line.starts_with("[x] ") {
    Task { done: true, text: line.slice(4, line.len()).trim() }
  } else if line.starts_with("[ ] ") {
    Task { done: false, text: line.slice(4, line.len()).trim() }
  } else {
    Task { done: false, text: line.trim() }
  }

let main = () -> void => {
  let task = parse_line("[x] buy milk")
  println("${task.done}: ${task.text}")
}
```

The subcommand is `args.positional[0]` and its argument is the rest, so `add buy milk`
joins the words after the command into one task.

**One rule in it is worth more than the rest of the program.** The list prints unfinished
tasks first, and `done N` takes the number the list printed. Those are the same number
only because the sort happens when the file is *loaded*, so every command sees one order.
Sorting for display instead would number the tasks one way and address them another — and
the mistake would look correct for as long as nothing was finished, since the two orders
agree until the first `[x]`.

```lyra
struct Task {
  done: bool,
  text: string,
}

// 0 before 1, so the unfinished sort first. `sorted_by` is stable, so tasks keep the
// order they were added in within each group.
let rank = pure noalloc (task: Task) -> i64 => if task.done { 1 } else { 0 }

let main = () -> void => {
  let tasks: []Task = [
    Task { done: true, text: "write the guide" },
    Task { done: false, text: "buy milk" },
  ]
  let ordered = tasks.sorted_by(pure (a: Task, b: Task) => rank(a) <=> rank(b))
  for i, task in ordered { println("${i + 1}. ${task.text}") }
}
```

That is the class of bug this language is built to make loud, and it is worth noticing
that the compiler cannot: both orders type-check, and only a test that finishes a task
and then addresses it by number tells the two apart.
