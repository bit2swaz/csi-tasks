package main

import (
	"fmt"
	"sort"
)

// mkdir(path)
func (fs *FileSystem) Mkdir(path string) error {
	parent, name, err := fs.traverseToParent(path)
	if err != nil {
		return err
	}

	if _, exists := parent.children[name]; exists {
		return fmt.Errorf("directory already exists: %s", name)
	}

	parent.children[name] = NewDirectory(name)
	return nil
}

// touch(path)
func (fs *FileSystem) Touch(path string, content string) error {
	parent, name, err := fs.traverseToParent(path)
	if err != nil {
		return err
	}

	if _, exists := parent.children[name]; exists {
		return fmt.Errorf("file already exists: %s", name)
	}

	parent.children[name] = &File{name: name, content: content}
	return nil
}

// ls(path)
func (fs *FileSystem) Ls(path string) ([]string, error) {
	var targetDir *Directory
	
	if path == "/" {
		targetDir = fs.root
	} else {
		parent, name, err := fs.traverseToParent(path)
		if err != nil {
			return nil, err
		}
		
		node, exists := parent.children[name]
		if !exists {
			return nil, fmt.Errorf("path not found: %s", path)
		}
		
		if !node.IsDirectory() {
			return nil, fmt.Errorf("not a directory: %s", path)
		}
		targetDir = node.(*Directory)
	}

	// Sort keys for consistent output
	var result []string
	for name := range targetDir.children {
		result = append(result, name)
	}
	sort.Strings(result)
	return result, nil
}

// cat(path)
func (fs *FileSystem) Cat(path string) (string, error) {
	parent, name, err := fs.traverseToParent(path)
	if err != nil {
		return "", err
	}

	node, exists := parent.children[name]
	if !exists {
		return "", fmt.Errorf("file not found: %s", name)
	}

	if node.IsDirectory() {
		return "", fmt.Errorf("cannot cat a directory: %s", name)
	}

	return node.(*File).content, nil
}

// rm(path)
func (fs *FileSystem) Rm(path string) error {
	if path == "/" {
		return fmt.Errorf("cannot remove root directory")
	}

	parent, name, err := fs.traverseToParent(path)
	if err != nil {
		return err
	}

	if _, exists := parent.children[name]; !exists {
		return fmt.Errorf("path not found: %s", name)
	}

	// Go's Garbage Collector handles the recursive cleanup
	// simply by removing the reference from the map
	delete(parent.children, name)
	return nil
}