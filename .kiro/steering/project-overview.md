---
inclusion: auto
---

# PulsyFlux Node.js Broker

Node.js bindings for PulsyFlux — a high-performance pub/sub message broker with a native C++ addon and Go shared library.

## Repository Structure

All source lives at the repository root:

- `broker_lib.go` — cgo exports (`ServerNew`, `ServerStart`, `ServerAddr`, `ServerStop`, `NewClient`, `Publish`, `Subscribe`, `FreePayload`, `Cleanup`)
- `addon.cc` — N-API C++ addon that loads `broker_lib.dll` and exposes `Server`/`Client` classes
- `registry.mjs` — ES module wrapper that re-exports native classes with a JS `Client` wrapper adding `onMessage()` support
- `build.mjs` — zig-build script for compiling C++ addon
- `postinstall.mjs` — consumer-side build pipeline (Go check, shared lib build, addon build)
- `types/index.d.ts` — TypeScript declarations
- `spec/` — Jasmine tests (`broker.spec.mjs`, `broker-benchmark.spec.mjs`)

## Related Projects (separate repositories)

- [github.com/pulsyflux/tcp](https://pkg.go.dev/github.com/pulsyflux/tcp) — Low-level TCP connection abstraction (Go)
- [github.com/pulsyflux/broker](https://pkg.go.dev/github.com/pulsyflux/broker) — Channel-based pub/sub message broker (Go)

## Module Info

- Node.js package: `@pulsyflux/nodejs-broker` (published to npm)
- Go dependency: `github.com/pulsyflux/broker` (imported by `broker_lib.go` for the shared library build)

## Architecture

```
Node.js → registry.mjs → broker_addon.node (C++ N-API) → broker_lib.dll (Go cgo)
```

Build outputs to `.bin/release/`: `broker_lib.dll`, `broker_addon.node`, `registry.mjs`

## MessageWorker (Async Receive)

- `MessageWorker` extends `Napi::AsyncWorker`
- Polls `Subscribe()` in background thread: 100 iterations × 1ms sleep = ~100ms polling window
- On message: calls JS callback, schedules next worker (continuous polling loop)
- Stored as `Napi::FunctionReference` on Client instance

## API Surface

- `Server(address)` — `.start()`, `.addr()`, `.stop()`
- `Client(address, channelID)` — `.publish(string|Buffer)`, `.subscribe()` (polling), `.onMessage(callback)` (event-driven), `.close()` (no-op)

## Build

- Go shared library: `go build -buildmode=c-shared -o .bin/release/broker_lib.dll broker_lib.go`
- C++ addon: `node build.mjs` (uses zig-build)

## Testing

- Jasmine specs in `spec/` (`broker.spec.mjs`, `broker-benchmark.spec.mjs`)
- Run: `npx jasmine`

## Performance

- ~13µs publish latency, 50K-76K publish ops/sec, ~20ms receive latency (AsyncWorker polling)
