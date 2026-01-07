package main

import (
	"reflect"
	"testing"
)

// TestMkdir uses table driven testing to verify directory creation logic
func TestMkdir(t *testing.T) {
	tests := []struct {
		name      string
		setup     func(*FileSystem)
		path      string
		expectErr bool
	}{
		{
			name:      "Create directory in root",
			setup:     nil,
			path:      "/home",
			expectErr: false,
		},
		{
			name:      "Create nested directory without parent",
			setup:     nil,
			path:      "/home/user",
			expectErr: true, // Should fail because /home doesn't exist
		},
		{
			name: "Create existing directory",
			setup: func(fs *FileSystem) {
				_ = fs.Mkdir("/home")
			},
			path:      "/home",
			expectErr: true, // Should fail because it exists
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fs := NewFileSystem()
			if tt.setup != nil {
				tt.setup(fs)
			}

			err := fs.Mkdir(tt.path)
			if (err != nil) != tt.expectErr {
				t.Errorf("Mkdir() error = %v, expectErr %v", err, tt.expectErr)
			}
		})
	}
}

// TestTouch verifies file creation
func TestTouch(t *testing.T) {
	fs := NewFileSystem()
	_ = fs.Mkdir("/docs")

	// Test 1: Create valid file
	err := fs.Touch("/docs/note.txt", "content")
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	// Test 2: Create file in non-existent directory
	err = fs.Touch("/invalid/note.txt", "content")
	if err == nil {
		t.Error("Expected error for missing parent directory, got nil")
	}

	// Test 3: Overwrite existing file (should fail based on our requirements)
	err = fs.Touch("/docs/note.txt", "new content")
	if err == nil {
		t.Error("Expected error when creating existing file, got nil")
	}
}

// TestLs verifies listing contents
func TestLs(t *testing.T) {
	fs := NewFileSystem()
	_ = fs.Mkdir("/usr")
	_ = fs.Mkdir("/usr/bin")
	_ = fs.Touch("/usr/config", "data")

	// Expected output sorted
	expected := []string{"bin", "config"}

	result, err := fs.Ls("/usr")
	if err != nil {
		t.Fatalf("Ls failed: %v", err)
	}

	// Compare slices
	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Ls() = %v, want %v", result, expected)
	}
}

// TestRecursiveDelete simulates a full lifecycle
func TestRecursiveDelete(t *testing.T) {
	fs := NewFileSystem()

	// 1. Setup a tree: /a/b/file.txt
	_ = fs.Mkdir("/a")
	_ = fs.Mkdir("/a/b")
	_ = fs.Touch("/a/b/file.txt", "secret data")

	// 2. Verify file exists
	content, err := fs.Cat("/a/b/file.txt")
	if err != nil || content != "secret data" {
		t.Fatalf("Setup failed, could not read file")
	}

	// 3. Delete parent /a
	err = fs.Rm("/a")
	if err != nil {
		t.Fatalf("Rm failed: %v", err)
	}

	// 4. Verify /a is gone
	_, err = fs.Ls("/a")
	if err == nil {
		t.Error("Expected error listing deleted directory /a, got nil")
	}

	// 5. Verify deep file is gone (Recursive check)
	_, err = fs.Cat("/a/b/file.txt")
	if err == nil {
		t.Error("Expected error reading file in deleted directory, got nil")
	}
}
