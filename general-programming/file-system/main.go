package main

import (
	"bufio"
	"flag"
	"fmt"
	"os"
	"strings"
)

const (
	version = "1.0.0"
)

func printHelp() {
	fmt.Println("In-Memory File System - A hierarchical file system simulator")
	fmt.Println("\nUsage:")
	fmt.Println("  file-system [flags]")
	fmt.Println("\nFlags:")
	fmt.Println("  -h, --help       Show this help message")
	fmt.Println("  -v, --version    Show version information")
	fmt.Println("  -i, --interactive Start interactive shell (default)")
	fmt.Println("\nAvailable Commands:")
	fmt.Println("  mkdir <path>              Create a new directory")
	fmt.Println("  touch <path> [content]    Create a new file with optional content")
	fmt.Println("  ls [path]                 List contents of directory (defaults to /)")
	fmt.Println("  cat <path>                Display file contents")
	fmt.Println("  rm <path>                 Remove file or directory recursively")
	fmt.Println("  help                      Show available commands")
	fmt.Println("  exit                      Exit the application")
	fmt.Println("\nExamples:")
	fmt.Println("  > mkdir /home/user")
	fmt.Println("  > touch /home/user/file.txt Hello World")
	fmt.Println("  > ls /home")
	fmt.Println("  > cat /home/user/file.txt")
	fmt.Println("  > rm /home/user/file.txt")
}

func printVersion() {
	fmt.Printf("In-Memory File System v%s\n", version)
	fmt.Println("A hierarchical file system simulator written in Go")
}

func printBanner() {
	fmt.Printf("Welcome!\n")
	fmt.Println("Type 'help' for available commands or 'exit' to quit")
	fmt.Println()
}

func printCommandHelp() {
	fmt.Println("\nAvailable Commands:")
	fmt.Println("  mkdir <path>              Create a new directory")
	fmt.Println("  touch <path> [content]    Create a file with optional content")
	fmt.Println("  ls [path]                 List directory contents (default: /)")
	fmt.Println("  cat <path>                Display file contents")
	fmt.Println("  rm <path>                 Remove file or directory")
	fmt.Println("  help                      Show this help")
	fmt.Println("  exit                      Exit the program")
	fmt.Println()
}

func runInteractiveShell() {
	fs := NewFileSystem()
	scanner := bufio.NewScanner(os.Stdin)

	printBanner()

	for {
		// 1. Print Prompt
		fmt.Print("> ")
		if !scanner.Scan() {
			break
		}

		// 2. Parse Input
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}

		parts := strings.Fields(line)
		cmd := parts[0]

		// 3. Execute Command
		switch cmd {
		case "help":
			printCommandHelp()

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
			fmt.Printf("unknown command: '%s'. Type 'help' for available commands.\n", cmd)
		}
	}
}

func main() {
	// Define flags
	helpFlag := flag.Bool("h", false, "Show help message")
	helpLongFlag := flag.Bool("help", false, "Show help message")
	versionFlag := flag.Bool("v", false, "Show version information")
	versionLongFlag := flag.Bool("version", false, "Show version information")
	interactiveFlag := flag.Bool("i", false, "Start interactive shell")
	interactiveLongFlag := flag.Bool("interactive", false, "Start interactive shell")

	flag.Parse()

	// Handle flags
	if *helpFlag || *helpLongFlag {
		printHelp()
		return
	}

	if *versionFlag || *versionLongFlag {
		printVersion()
		return
	}

	// Default behavior or explicit interactive flag
	if *interactiveFlag || *interactiveLongFlag || flag.NArg() == 0 {
		runInteractiveShell()
	} else {
		fmt.Println("Error: Invalid arguments")
		fmt.Println("Use -h or --help for usage information")
		os.Exit(1)
	}
}
