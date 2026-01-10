package main

import (
	"bufio"
	"flag"
	"fmt"
	"os"
	"strings"
)

const version = "1.0.0"

func printHelp() {
	fmt.Println("Course Management System - A university course dependency manager")
	fmt.Println("\nUsage:")
	fmt.Println("  course-manager [flags]")
	fmt.Println("\nFlags:")
	fmt.Println("  -h, --help       Show this help message")
	fmt.Println("  -v, --version    Show version information")
	fmt.Println("  -i, --interactive Start interactive shell (default)")
	fmt.Println("\nAvailable Commands:")
	fmt.Println("  add <id> <name>                   Register a new course")
	fmt.Println("  prereq <courseID> <prereqID>      Add a prerequisite dependency")
	fmt.Println("  ls <courseID>                     List all prerequisites for a course")
	fmt.Println("  enroll <courseID> [completed...]  Check enrollment eligibility")
	fmt.Println("  rm <courseID>                     Remove a course")
	fmt.Println("  help                              Show available commands")
	fmt.Println("  exit                              Exit the application")
	fmt.Println("\nExamples:")
	fmt.Println("  > add CS101 Introduction to Computer Science")
	fmt.Println("  > add CS201 Data Structures")
	fmt.Println("  > prereq CS201 CS101")
	fmt.Println("  > ls CS201")
	fmt.Println("  > enroll CS201 CS101")
}

func printVersion() {
	fmt.Printf("Course Management System v%s\n", version)
	fmt.Println("A university course dependency manager with DAG validation")
}

func printCommandHelp() {
	fmt.Println("\nAvailable Commands:")
	fmt.Println("  add <id> <name>                   Register a new course")
	fmt.Println("  prereq <courseID> <prereqID>      Add prerequisite dependency")
	fmt.Println("  ls <courseID>                     List all prerequisites")
	fmt.Println("  enroll <courseID> [completed...]  Check if eligible to enroll")
	fmt.Println("  rm <courseID>                     Remove a course")
	fmt.Println("  help                              Show this help")
	fmt.Println("  exit                              Exit the program")
	fmt.Println()
}

func runInteractiveShell() {
	cm := NewCourseManager()
	scanner := bufio.NewScanner(os.Stdin)

	fmt.Println("Course Management System started.")
	fmt.Println("Type 'help' for available commands or 'exit' to quit.")
	fmt.Println()

	for {
		fmt.Print("> ")
		if !scanner.Scan() {
			break
		}

		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}

		parts := strings.Fields(line)
		cmd := parts[0]

		switch cmd {
		case "help":
			printCommandHelp()

		case "add":
			if len(parts) < 3 {
				fmt.Println("usage: add <id> <name>")
				continue
			}
			name := strings.Join(parts[2:], " ")
			if err := cm.AddCourse(parts[1], name); err != nil {
				fmt.Println("error:", err)
			} else {
				fmt.Println("ok")
			}

		case "prereq":
			if len(parts) < 3 {
				fmt.Println("usage: prereq <courseID> <prereqID>")
				continue
			}
			if err := cm.AddPrerequisite(parts[1], parts[2]); err != nil {
				fmt.Println("error:", err)
			} else {
				fmt.Println("ok")
			}

		case "ls":
			if len(parts) < 2 {
				fmt.Println("usage: ls <courseID>")
				continue
			}
			list, err := cm.ListPrerequisites(parts[1])
			if err != nil {
				fmt.Println("error:", err)
			} else {
				fmt.Printf("prerequisites for %s: %v\n", parts[1], list)
			}

		case "rm":
			if len(parts) < 2 {
				fmt.Println("usage: rm <courseID>")
				continue
			}
			if err := cm.RemoveCourse(parts[1]); err != nil {
				fmt.Println("error:", err)
			} else {
				fmt.Println("ok")
			}

		case "enroll":
			// usage: enroll targetID completed1 completed2 ...
			if len(parts) < 2 {
				fmt.Println("usage: enroll <targetID> [completed_courses...]")
				continue
			}
			completed := parts[2:]
			ok, err := cm.CanEnroll(parts[1], completed)
			if err != nil {
				fmt.Println("error:", err)
			} else {
				fmt.Println(ok)
			}

		case "exit":
			fmt.Println("Shutting down...")
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
