---
name: GSAP context TDZ (temporal dead zone)
description: let/const declarations inside gsap.context() callbacks are still subject to TDZ; declare variables before any block that assigns to them
---

JavaScript `let` and `const` inside a `gsap.context(() => { ... })` callback are fully subject to the temporal dead zone. If a variable is declared with `let` but an assignment block references it earlier in the same callback (e.g. an init block before a declarations cluster), the runtime throws `Cannot access 'X' before initialization`.

**Why:** GSAP context callbacks are plain JS functions — no hoisting magic. The TDZ applies exactly as in any function body.

**How to apply:** Always declare `let ruleH`, `let s0`, etc. at the TOP of the desktop section (after the `if (isMobile) return;` guard), before any init block that reads or writes those variables. Group all variable declarations at the start of the desktop path so execution order matches declaration order.
