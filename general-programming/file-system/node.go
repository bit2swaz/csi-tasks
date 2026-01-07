package main

// Node is the common interface for Files and Directories.
// This allows a Directory to hold a map of Nodes without caring what they are.
type Node interface {
	Name() string
	IsDirectory() bool
}

// File represents a text file
type File struct {
	name    string
	content string
}

func (f *File) Name() string      { return f.name }
func (f *File) IsDirectory() bool { return false }

// Directory represents a folder containing other Nodes
type Directory struct {
	name     string
	children map[string]Node
}

func (d *Directory) Name() string      { return d.name }
func (d *Directory) IsDirectory() bool { return true }

func NewDirectory(name string) *Directory {
	return &Directory{
		name:     name,
		children: make(map[string]Node),
	}
}