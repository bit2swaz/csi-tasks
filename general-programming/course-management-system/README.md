# in memory course management system

this project implements a course management system for a university. it manages course dependencies using a directed acyclic graph (dag) to handle prerequisites and validate enrollment eligibility.

## features

- **add course**: register a new course with a unique id.
- **manage prerequisites**: add dependencies between courses.
- **cycle detection**: prevents invalid prerequisite chains (e.g., a->b->a).
- **deep listing**: lists all direct and indirect prerequisites for a course.
- **enrollment check**: verifies if a student has completed all necessary courses (recursive check) before enrolling.

## usage

### running the system

start the interactive shell:
```go
go run .
```

### commands
```
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

exit
# close the program.
```

## testing

run unit tests to verify cycle detection and logic:
```go
go test -v
```