# in memory file storage

this project implements a simple in-memory file system in go. it mimics the structure of a hierarchical file system using object-oriented design principles.

## features

the system supports the following operations:
- mkdir: create a new directory
- touch: create a new file with text content
- ls: list contents of a directory
- rm: delete a file or directory recursively
- cat: read the content of a file

## design

the core design relies on the composite pattern to treat files and directories uniformly where appropriate.

- node interface: a common interface shared by files and directories.
- directory struct: contains a map of children nodes, allowing for o(1) lookups and ensuring file names are unique within a folder.
- file struct: stores the name and text content.
- filesystem struct: manages the root directory and path traversal logic.

this architecture avoids global variables and prevents large if/else chains by using polymorphism and helper methods for traversal.

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

once the shell starts, you will see a banner and a `>` prompt. you can execute the following commands:
```bash
mkdir <path>
# create a directory (e.g., mkdir /usr)

touch <path> [content]
# create a file with optional content (e.g., touch /usr/file.txt hello world)

ls [path]
# list directory contents. defaults to root if path is omitted.

cat <path>
# print the content of a file to the terminal.

rm <path>
# remove a file or directory recursively.

help
# show available commands and their usage.

exit
# close the application.
```

#### example session

```bash
$ go run .

Welcome!
Type 'help' for available commands or 'exit' to quit

> mkdir /home/user
ok
> touch /home/user/readme.txt Welcome to the file system
ok
> ls /home
user
> cat /home/user/readme.txt
Welcome to the file system
> help

Available Commands:
  mkdir <path>              Create a new directory
  touch <path> [content]    Create a file with optional content
  ls [path]                 List directory contents (default: /)
  cat <path>                Display file contents
  rm <path>                 Remove file or directory
  help                      Show this help
  exit                      Exit the program

> exit
shutting down...
```

### testing

the project includes a test suite covering unit tests for operations and integration tests for full workflows.

run the tests:
```go
go test -v
```

check test coverage:
```go
go test -cover
```