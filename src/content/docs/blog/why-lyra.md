---
title: Why I'm Building a Programming Language for Game Development
date: 2026-06-17
tags:
  - lyra
  - language-design
  - ecs
  - compilers
excerpt: Lyra is my attempt to make ECS a first-class language feature instead of a bolted-on library — here's the problem it solves, the bet behind it, and why it's written in Go for now.
---

I've spent the last twenty years building web applications. TypeScript, React, the whole stack — I know it well, and I've made a living from it. But for a long time I've had a parallel obsession: games, and more specifically, the tools people use to build them.

A few years ago I started taking that obsession seriously. And the more I looked at the landscape of systems languages available to game developers today — C++, Rust, Zig, Odin — the more I felt something was missing. Not a missing feature, exactly. A missing *philosophy*.

That's what led me to start building Lyra.

## The Problem with "Good Enough"

C++ is still the dominant language in AAA game development, and for understandable reasons: it's fast, it has a massive ecosystem, and everyone already knows it. But it's also a language that accretes complexity like barnacles. The object-oriented mental model it encourages leads developers toward cache-unfriendly data layouts, deep inheritance hierarchies, and pointer soup that the optimizer struggles to reason about.

The game development community has largely figured out a better way to structure data: Entity-Component-System (ECS). Instead of objects that own their data, you separate *what things are* (entities) from *what properties they have* (components) from *what logic transforms those properties* (systems). The result is better cache locality, cleaner parallelism, and — once you internalize the mental model — surprisingly readable code.

The problem is that ECS, in every language I've seen it implemented, is a *library*, not a *language feature*. You get Bevy in Rust, EnTT in C++, Flecs for C. These are impressive pieces of engineering, but they're all fighting the host language to express something that the language was never designed to say.

What would it look like if ECS were *first-class*?

## The Bet

Lyra is my attempt to answer that question. The core thesis is simple: **if ECS is the right architecture for high-performance game development, then a language built for game development should make ECS a native concept, not an imported one.**

That means dedicated syntax. In Lyra, `component`, `resource`, `system`, and `schedule` are keywords, not struct tags or trait implementations. The language knows what a component is. The type system understands query access semantics. The scheduler can reason about which systems read and write which components, and enforce safe ordering at compile time.

Here's a rough taste of what that looks like:

<!-- lyra:no-check -->
```lyra
component Position {
    x: f32,
    y: f32,
}

component Velocity {
    dx: f32,
    dy: f32,
}

system move_entities {
    @with(Position, Velocity)
    fn update(var pos: Position, vel: Velocity) {
        pos.x += vel.dx
        pos.y += vel.dy
    }
}
```

The `var` keyword on `pos` isn't incidental — it's how Lyra encodes write access. A system that takes `vel: Velocity` without `var` is declaring a read-only dependency. The scheduler uses this information to determine which systems can safely run in parallel and which must be sequenced.

This is the kind of thing that's awkward to express in a general-purpose language without either runtime overhead or macro wizardry. In Lyra, it's just how you write code.

## The Toolchain

Lyra's compiler is written in Go. Rust would have been a natural choice for compiler work, and I considered it seriously — but I couldn't quite get over the borrow-checker hump, and at some point I decided that Go was the path of lesser resistance. That turned out to be the right call: [tree-sitter](https://tree-sitter.github.io/tree-sitter/) has solid Go bindings, so there was no tradeoff on the parsing side, and keeping the entire toolchain — parser, AST, type checker, LSP server, compiler — in one language and one module means no context-switching and no FFI boundary to debug.

The Go implementation is also explicitly temporary. The long-term plan is to rewrite the toolchain in Lyra itself, which is a tradition as old as compilers. A language that can bootstrap its own compiler is a meaningful proof of maturity.

The pipeline looks like this:

```
source text
  → tree-sitter grammar     (concrete syntax tree)
  → collector               (CST → typed AST)
  → checker                 (control-flow, use-before-declaration, shadowing)
  → typechecker             (type inference and constraint solving)
  → LLVM IR                 (code generation, not yet implemented)
```

The LSP server (`lyra-lsp`) runs this full pipeline on every document change and publishes diagnostics back to the editor. It's deliberately kept as a lightweight binary — the LLVM dependency lives only in the compiler binary.

The language currently has a working parser, AST, symbol table, and typechecker. LLVM code generation is the next major milestone. Runnable Lyra programs are still some months away.

## The Strategy

One thing I've learned from watching language projects succeed and fail: a language needs a *proof of concept you can play*. Jonathan Blow spent years building Jai in private, and the thing that kept people interested wasn't the language itself — it was watching him build a real game with it. The language and the game validated each other.

I'm taking a similar approach. Once Lyra is capable enough, I plan to build a game in it. The game concept I'm exploring is a real-time strategy/sim where players program unit behavior using a visual node graph — something that maps naturally onto ECS architecture and makes the language's design choices immediately legible to anyone watching.

The development blog you're reading now is the other half of that strategy. I'll be writing about compiler design, language theory, ECS semantics, and the specific decisions that go into making Lyra's design coherent. It's a technical audience I'm writing for — if you've ever wanted to understand how a tree-sitter grammar becomes a type-checked AST, you're in the right place.

## What's Next

The immediate roadmap:

- Finish the typechecker (match exhaustiveness, range types, collection type checking)
- Implement LLVM IR code generation
- Nail down ECS syntax and integrate it into the grammar
- Build something that runs

If you want to follow along, the source is on [GitHub](https://github.com/Lyra-Language/lyra). It's early and rough in places, but it's real.

The next post will go deeper into the ECS type system design — specifically, how `var` access semantics interact with the scheduler and why that's a more tractable problem than the general aliasing issue Jonathan Blow ran into with Jai.

*Avram — building Lyra one commit at a time*
