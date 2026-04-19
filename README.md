# @pulsyflux/nodejs-broker

Node.js bindings for **PulsyFlux** — a high-performance pub/sub message broker using a native C++ addon and Go shared library.

## Architecture

```
Node.js → registry.mjs → broker_addon.node (C++ N-API) → broker_lib.dll (Go cgo)
```

## Quick Start

```javascript
import { Server, Client } from '@pulsyflux/nodejs-broker';
import { randomUUID } from 'crypto';

const server = new Server(':0');
server.start();

const channelID = randomUUID();
const client1 = new Client(server.addr(), channelID);
const client2 = new Client(server.addr(), channelID);

client2.onMessage((msg) => {
  console.log('Received:', msg.toString());
});

client1.publish('hello from nodejs!');

server.stop();
```

## API

### Server

- `new Server(address)` — create broker server (`:0` for random port)
- `server.start()` — start listening
- `server.addr()` — get actual listen address
- `server.stop()` — stop server and close connections

### Client

- `new Client(address, channelID)` — connect to a channel (UUID)
- `client.publish(payload)` — publish string or Buffer (sender excluded)
- `client.onMessage(callback)` — event-driven receive (recommended)
- `client.subscribe()` — polling receive, returns Buffer or null

## Build

```bash
# Go shared library
go build -buildmode=c-shared -o .bin/release/broker_lib.dll broker_lib.go

# C++ addon
node build.mjs
```

Artifacts output to `.bin/release/`: `broker_lib.dll`, `broker_addon.node`, `registry.mjs`

## Test

```bash
npx jasmine
```

## Key Features

- Connection pooling — multiple clients share physical TCP connections
- Multiplexing — logical connections over shared sockets
- Sender exclusion — publishers don't receive own messages
- Channel isolation — messages don't leak between channels
- Raw bytes — no serialization overhead

## Limitations

- Windows-only (DLL loading via `LoadLibraryA`)
- No message persistence or delivery guarantees
- No authentication
- 30-second idle timeout
- Slow subscribers drop messages (100-message buffer)
- AsyncWorker polling adds ~20ms receive latency

## Related Projects

- [pulsyflux/tcp](https://pkg.go.dev/github.com/pulsyflux/tcp) — TCP connection abstraction (Go)
- [pulsyflux/broker](https://pkg.go.dev/github.com/pulsyflux/broker) — Pub/sub message broker (Go)

## Steering

Project conventions and guides live in [`.kiro/steering/`](.kiro/steering/):

- [Project Overview](.kiro/steering/project-overview.md) — architecture, build pipeline, file map
- [Coding Standards](.kiro/steering/coding-standards.md) — addon conventions, control protocol, testing patterns
- [CI Workflow Guide](.kiro/steering/ci-workflow-guide.md) — GitHub Actions rules and local testing with Act

## License

MIT
