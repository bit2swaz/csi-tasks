package main

import "sync"

// handles thread-safe access to document contents
type DocumentStore struct {
	sync.RWMutex
	docs map[string]string // ID -> content
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

func (s *DocumentStore) List() []string {
	s.RLock()
	defer s.RUnlock()
	keys := make([]string, 0, len(s.docs))
	for k := range s.docs {
		keys = append(keys, k)
	}
	return keys
}

func (s *DocumentStore) Delete(id string) {
	s.Lock()
	defer s.Unlock()
	delete(s.docs, id)
}

func (s *DocumentStore) Create(id string) {
	s.Lock()
	defer s.Unlock()
	if _, exists := s.docs[id]; !exists {
		s.docs[id] = ""
	}
}

// global store instance
var store = NewDocumentStore()
