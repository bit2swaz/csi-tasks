package main

// Course represents a single university course
type Course struct {
	ID   string
	Name string
	// stored as a map for O(1) checks, the value (bool) is ignored
	PrereqIDs map[string]bool
}

// NewCourse behaves like a constructor
func NewCourse(id, name string) *Course {
	return &Course{
		ID:        id,
		Name:      name,
		PrereqIDs: make(map[string]bool),
	}
}
