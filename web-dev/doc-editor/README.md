# real-time collaborative document editor

this project is a web-based platform that allows multiple users to edit documents simultaneously.

it uses a go backend for high concurrency websocket handling and a nextjs frontend for the ui.

## tech stack

- backend: go (golang), gorilla/websockets
- frontend: nextjs 16 (app router), tailwind css v4, typescript
- testing: go testing (backend), jest + react testing library (frontend)

## features

- real-time collaboration: multiple users can edit the same document with sub-millisecond sync.
- presence awareness: users can see who is currently in the session.
- persistence: document state is maintained in-memory on the server.
- concurrency control: robust backend design handles simultaneous writes without race conditions.
- authentication: simple username-based session gating.
- responsive ui: speaks for itself.

## architecture

### backend design
the backend uses the hub and spoke pattern to manage websocket connections.

- hub: manages active "rooms" (documents). each document is a room containing a map of connected clients.
- store: a thread-safe in-memory store protected by a read-write mutex to prevent data races during concurrent edits.
- concurrency safety: each client connection is wrapped in a struct with its own mutex to serialize write operations, preventing websocket protocol violations.
- read-your-writes: the broadcast logic is optimized to send updates to all clients except the sender, preventing input glitching on the active user's screen.

### frontend design
the frontend connects to the backend via websockets.

- optimistic ui: the editor updates local state immediately before sending data to the server to ensure zero input latency.
- eventual consistency: the client listens for "update" messages to sync state with other collaborators.
- authentication: route protection prevents access to documents without a valid session.

## setup and usage

### prerequisites
ensure you have go 1.25+ and nodejs 24+ installed.

### backend setup
```bash
# navigate to the backend directory:
cd backend

# install dependencies:
go get

# run the server:
go run .
```

the backend will start on localhost:8080.

### frontend setup
```bash
# navigate to the frontend directory:
cd frontend

# install dependencies:
npm install

# run the development server:
npm run dev
```

access the application at localhost:3000.

## testing

### backend tests
the backend includes tests for concurrency (race conditions) and websocket broadcasting.

run tests with race detection enabled:
```bash
cd backend
go test -v -race
```

### frontend tests
the frontend includes integration tests for authentication flows and dashboard data fetching.

run tests:
```bash
cd frontend
npm test
```

## api reference

### http endpoints
- POST /login: accepts a username and returns a session status.
- GET /documents: returns a list of available document ids.

### websocket protocol
endpoint: ws://localhost:8080/ws?docID=[id]

messages are json objects:
- client to server: {"content": "text..."}
- server to client (init): {"type": "init", "content": "full text..."}
- server to client (update): {"type": "update", "content": "new text..."}