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

### running the code

clone the repository and navigate to the project folder.

start the interactive shell:
```go
go run .
```

once the shell starts, you will see a > prompt. you can execute the following commands:
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

exit
# close the application.
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