package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/rs/cors"
)

func main() {
	hub := NewHub()
	mux := http.NewServeMux()

	// 1. Mock Login
	mux.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		username := r.FormValue("username")
		if username == "" {
			http.Error(w, "username required", http.StatusBadRequest)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "user": username})
	})

	// 2. Document List
	mux.HandleFunc("/documents", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		// Hardcoded for demo simplicity
		json.NewEncoder(w).Encode([]string{"doc-1", "doc-2", "notes"})
	})

	// 3. WebSocket Connection
	mux.HandleFunc("/ws", hub.HandleWebSocket)

	// CORS (Allow Frontend on localhost:3000)
	handler := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST"},
	}).Handler(mux)

	fmt.Println("Backend listening on :8080")
	http.ListenAndServe(":8080", handler)
}
