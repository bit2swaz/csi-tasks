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

	// initialize with some default documents
	store.Create("doc-1")
	store.Create("doc-2")
	store.Create("notes")

	// 1. mock login
	mux.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		username := r.FormValue("username")
		if username == "" {
			http.Error(w, "username required", http.StatusBadRequest)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "user": username})
	})

	// 2. document list
	mux.HandleFunc("/documents", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if r.Method == "GET" {
			json.NewEncoder(w).Encode(store.List())
		} else if r.Method == "POST" {
			// create new document
			var req map[string]string
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				http.Error(w, "invalid request", http.StatusBadRequest)
				return
			}
			docID := req["id"]
			if docID == "" {
				http.Error(w, "id required", http.StatusBadRequest)
				return
			}
			store.Create(docID)
			json.NewEncoder(w).Encode(map[string]string{"status": "ok", "id": docID})
		} else {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// 3. delete document
	mux.HandleFunc("/documents/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "DELETE" {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		docID := r.URL.Path[len("/documents/"):]
		if docID == "" {
			http.Error(w, "id required", http.StatusBadRequest)
			return
		}
		store.Delete(docID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	// 4. websocket connection
	mux.HandleFunc("/ws", hub.HandleWebSocket)

	// CORS (Allow Frontend on localhost:3000)
	handler := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "DELETE"},
	}).Handler(mux)

	fmt.Println("Backend listening on :8080")
	http.ListenAndServe(":8080", handler)
}
