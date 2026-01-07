package main

import (
	"errors"
	"fmt"
	"strings"
)

type FileSystem struct {
	root *Directory
}

func NewFileSystem() *FileSystem {
	return &FileSystem{
		root: NewDirectory("/"),
	}
}

// helper: splits path into parts, ignoring empty strings from leading/trailing slashes
func parsePath(path string) []string {
	parts := strings.Split(path, "/")
	var clean []string
	for _, p := range parts {
		if p != "" {
			clean = append(clean, p)
		}
	}
	return clean
}

// helper: traverses to the directory containing the target node
// returns: the parent dir, the name of the target, and error if parent doesn't exist
func (fs *FileSystem) traverseToParent(path string) (*Directory, string, error) {
	if path == "/" {
		return nil, "", errors.New("cannot operate on root parent")
	}

	parts := parsePath(path)
	current := fs.root
	
	// Navigate up to the second to last part
	for i := 0; i < len(parts)-1; i++ {
		nextName := parts[i]
		nextNode, exists := current.children[nextName]
		
		if !exists {
			return nil, "", fmt.Errorf("directory not found: %s", nextName)
		}
		
		if !nextNode.IsDirectory() {
			return nil, "", fmt.Errorf("%s is not a directory", nextName)
		}
		
		current = nextNode.(*Directory)
	}
	
	targetName := parts[len(parts)-1]
	return current, targetName, nil
}