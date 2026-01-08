package main

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Client wraps the connection with a Mutex to ensure thread safety
type Client struct {
	Conn *websocket.Conn
	Mu   sync.Mutex // Protects WriteJSON
}

// WriteJSON is a thread-safe helper
func (c *Client) WriteJSON(v interface{}) error {
	c.Mu.Lock()
	defer c.Mu.Unlock()
	return c.Conn.WriteJSON(v)
}

type Hub struct {
	// map[docID] -> map[Client] -> true
	rooms map[string]map[*Client]bool
	sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		rooms: make(map[string]map[*Client]bool),
	}
}

func (h *Hub) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	docID := r.URL.Query().Get("docID")
	if docID == "" {
		http.Error(w, "docID required", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade error:", err)
		return
	}

	// Create a thread-safe client
	client := &Client{Conn: conn}

	// 1. Send Init State (Thread-safe now)
	currentContent := store.Get(docID)
	if err := client.WriteJSON(map[string]string{"type": "init", "content": currentContent}); err != nil {
		conn.Close()
		return
	}

	// 2. Register Client
	h.Lock()
	if h.rooms[docID] == nil {
		h.rooms[docID] = make(map[*Client]bool)
	}
	h.rooms[docID][client] = true
	h.Unlock()

	// Cleanup on exit
	defer func() {
		h.Lock()
		if h.rooms[docID] != nil {
			delete(h.rooms[docID], client)
			if len(h.rooms[docID]) == 0 {
				delete(h.rooms, docID)
			}
		}
		h.Unlock()
		conn.Close()
	}()

	// 3. Listen Loop
	for {
		var msg map[string]string
		// ReadJSON is safe to run concurrently with WriteJSON (one reader, one writer rule)
		err := conn.ReadJSON(&msg)
		if err != nil {
			break
		}

		newContent := msg["content"]
		store.Update(docID, newContent)
		h.broadcast(docID, newContent, client)
	}
}

func (h *Hub) broadcast(docID string, content string, sender *Client) {
	h.Lock()
	defer h.Unlock()

	for client := range h.rooms[docID] {
		if client != sender {
			// Now using the thread-safe WriteJSON method
			err := client.WriteJSON(map[string]string{
				"type":    "update",
				"content": content,
			})
			if err != nil {
				client.Conn.Close()
				delete(h.rooms[docID], client)
			}
		}
	}
}
