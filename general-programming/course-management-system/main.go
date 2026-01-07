package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	cm := NewCourseManager()
	scanner := bufio.NewScanner(os.Stdin)

	fmt.Println("course manager started. commands: add, prereq, ls, enroll, rm, exit")

	for {
		fmt.Print("> ")
		if !scanner.Scan() {
			break
		}
		
		line := scanner.Text()
		parts := strings.Fields(line)
		if len(parts) == 0 {
			continue
		}

		cmd := parts[0]

		switch cmd {
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
			return

		default:
			fmt.Println("unknown command")
		}
	}
}