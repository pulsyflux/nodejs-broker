---
inclusion: auto
---

# PulsyFlux Coding Standards

## Node.js Addon Conventions

- C++ addon uses N-API (node-addon-api)
- Go shared library exports use cgo with C-compatible signatures
- Memory: Go allocates via `C.CBytes`, Node.js copies via `Napi::Buffer::Copy`, caller frees via `FreePayload`
- Async message receiving: `MessageWorker` (AsyncWorker) polls with 1ms sleep, 100 iterations per cycle
- ES module wrapper in `registry.mjs` — keep the JS API clean and minimal

## Broker Control Protocol

- GlobalControlUUID: `00000000-0000-0000-0000-000000000000`
- Control message format: JSON `{"client_id": "uuid", "channel_id": "uuid"}`
- Handshake: client sends control msg → server registers → server sends ack byte (0x01) → client proceeds

## Testing Patterns

- Jasmine with `done` callback for async tests, `setTimeout` for connection setup delays
- Always use `:0` for server address in tests (OS-assigned port)
- Use `addon.cleanup()` in `afterAll` to clean up Go runtime resources
- Run specs: `npx jasmine`

## Platform

- Currently Windows-only (DLL loading, `LoadLibraryA`)
- Package published as `@pulsyflux/nodejs-broker` on npm (os: win32, cpu: x64)
