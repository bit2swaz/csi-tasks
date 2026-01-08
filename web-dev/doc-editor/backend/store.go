package main

import "sync"

// DocumentStore handles thread-safe access to document contents
type DocumentStore struct {
	sync.RWMutex
	docs map[string]string // ID -> Content
}

func NewDocumentStore() *DocumentStore {
	return &DocumentStore{
		docs: make(map[string]string),
	}
}

func (s *DocumentStore) Get(id string) string {
	s.RLock()
	defer s.RUnlock()
	return s.docs[id]
}

func (s *DocumentStore) Update(id, content string) {
	s.Lock()
	defer s.Unlock()
	s.docs[id] = content
}

// Global store instance
var store = NewDocumentStore()