# in memory course management system

this project implements a course management system for a university. it manages course dependencies using a directed acyclic graph (dag) to handle prerequisites and validate enrollment eligibility.

## features

- **add course**: register a new course with a unique id.
- **manage prerequisites**: add dependencies between courses.
- **cycle detection**: prevents invalid prerequisite chains (e.g., a->b->a).
- **deep listing**: lists all direct and indirect prerequisites for a course.
- **enrollment check**: verifies if a student has completed all necessary courses (recursive check) before enrolling.

## usage

### prerequisites

ensure you have go installed on your machine.

### running the application

clone the repository and navigate to the project folder.

#### command-line flags

the application supports the following flags:

```bash
# show help message
go run . --help
# or
go run . -h

# show version information
go run . --version
# or
go run . -v

# start interactive shell (default behavior)
go run .
# or explicitly
go run . --interactive
```

#### interactive shell

start the interactive shell:
```bash
go run .
```

once the shell starts, you will see a `>` prompt. you can execute the following commands:

### commands
```bash
add <id> <name>
# register a new course (e.g., add cs101 intro to cs)

prereq <course_id> <prereq_id>
# add a dependency. course_id requires prereq_id.

ls <course_id>
# list all direct and indirect prerequisites.

enroll <course_id> [completed_courses...]
# check if a student can enroll given their history.
# example: enroll cs301 cs101 cs201

rm <course_id>
# remove a course and clean up all references to it.

help
# show available commands and their usage.

exit
# close the program.
```

### example session

```bash
$ go run .

Course Management System started.
Type 'help' for available commands or 'exit' to quit.

> add CS101 Introduction to Computer Science
ok
> add CS201 Data Structures
ok
> add CS301 Algorithms
ok
> prereq CS201 CS101
ok
> prereq CS301 CS201
ok
> ls CS301
prerequisites for CS301: [CS101 CS201]
> enroll CS301 CS101 CS201
true
> enroll CS301 CS101
false
> help

Available Commands:
  add <id> <name>                   Register a new course
  prereq <courseID> <prereqID>      Add prerequisite dependency
  ls <courseID>                     List all prerequisites
  enroll <courseID> [completed...]  Check if eligible to enroll
  rm <courseID>                     Remove a course
  help                              Show this help
  exit                              Exit the program

> exit
Shutting down...
```

## testing

run unit tests to verify cycle detection and logic:
```go
go test -v
```