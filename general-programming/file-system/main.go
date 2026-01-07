package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	fs := NewFileSystem()
	scanner := bufio.NewScanner(os.Stdin)

	fmt.Println("file system started. commands: mkdir, touch, ls, rm, cat, exit")

	for {
		// 1. Print Prompt
		fmt.Print("> ")
		if !scanner.Scan() {
			break
		}

		// 2. Parse Input
		line := scanner.Text()
		parts := strings.Fields(line)
		if len(parts) == 0 {
			continue
		}

		cmd := parts[0]
		
		// 3. Execute Command
		switch cmd {
		case "mkdir":
			if len(parts) < 2 {
				fmt.Println("usage: mkdir <path>")
				continue
			}
			err := fs.Mkdir(parts[1])
			if err != nil {
				fmt.Println("error:", err)
			} else {
				fmt.Println("ok")
			}

		case "touch":
			if len(parts) < 2 {
				fmt.Println("usage: touch <path> [content]")
				continue
			}
			// Join remaining parts as content (allow spaces in text)
			content := ""
			if len(parts) > 2 {
				content = strings.Join(parts[2:], " ")
			}
			err := fs.Touch(parts[1], content)
			if err != nil {
				fmt.Println("error:", err)
			} else {
				fmt.Println("ok")
			}

		case "ls":
			path := "/" // Default to root if no path provided
			if len(parts) >= 2 {
				path = parts[1]
			}
			files, err := fs.Ls(path)
			if err != nil {
				fmt.Println("error:", err)
			} else {
				for _, f := range files {
					fmt.Println(f)
				}
			}

		case "rm":
			if len(parts) < 2 {
				fmt.Println("usage: rm <path>")
				continue
			}
			err := fs.Rm(parts[1])
			if err != nil {
				fmt.Println("error:", err)
			} else {
				fmt.Println("ok")
			}

		case "cat":
			if len(parts) < 2 {
				fmt.Println("usage: cat <path>")
				continue
			}
			content, err := fs.Cat(parts[1])
			if err != nil {
				fmt.Println("error:", err)
			} else {
				fmt.Println(content)
			}

		case "exit":
			fmt.Println("shutting down...")
			return

		default:
			fmt.Println("unknown command:", cmd)
		}
	}
}