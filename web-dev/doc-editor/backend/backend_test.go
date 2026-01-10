package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/gorilla/websocket"
)

// 1. test the "Database" for race conditions
// we simulate 100 goroutines trying to read/write the same doc at once.
func TestDocumentStoreConcurrency(t *testing.T) {
	s := NewDocumentStore()
	var wg sync.WaitGroup
	
	// 100 writers
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func(val int) {
			defer wg.Done()
			s.Update("doc-1", "content")
		}(i)
	}

	// 100 readers
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			_ = s.Get("doc-1")
		}()
	}

	wg.Wait()
	// If we reached here without a panic (concurrent map write), the Mutex works.
}

// 2. Integration Test: Real-Time Broadcast
// Client A edits -> Server -> Client B receives
func TestWebSocketBroadcast(t *testing.T) {
	// Setup Server
	hub := NewHub()
	server := httptest.NewServer(http.HandlerFunc(hub.HandleWebSocket))
	defer server.Close()

	// Convert http:// to ws://
	wsURL := "ws" + strings.TrimPrefix(server.URL, "http") + "?docID=test-doc"

	// Connect Client A
	clientA, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Client A failed to connect: %v", err)
	}
	defer clientA.Close()

	// Connect Client B
	clientB, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Client B failed to connect: %v", err)
	}
	defer clientB.Close()

	// Read initial "init" messages to clear the buffer
	var initMsg map[string]string
	clientA.ReadJSON(&initMsg)
	clientB.ReadJSON(&initMsg)

	// --- The Test ---

	// 1. Client A sends an edit
	expectedContent := "Hello from A"
	err = clientA.WriteJSON(map[string]string{
		"content": expectedContent,
	})
	if err != nil {
		t.Fatalf("Client A failed to write: %v", err)
	}

	// 2. Client B should receive it
	var msgB map[string]string
	
	// Set a timeout so the test doesn't hang forever if broken
	clientB.SetReadDeadline(time.Now().Add(time.Second * 2))
	err = clientB.ReadJSON(&msgB)
	if err != nil {
		t.Fatalf("Client B did not receive message: %v", err)
	}

	if msgB["type"] != "update" || msgB["content"] != expectedContent {
		t.Errorf("Client B got wrong message: %v", msgB)
	}

	// 3. Client A should NOT receive it (Read-Your-Writes Optimization)
	// We expect a timeout here because the server shouldn't echo back to sender
	clientA.SetReadDeadline(time.Now().Add(time.Millisecond * 500))
	err = clientA.ReadJSON(&initMsg)
	if err == nil {
		t.Error("Client A received its own message back (echo), which wastes bandwidth")
	}
}