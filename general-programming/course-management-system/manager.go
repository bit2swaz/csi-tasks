package main

import (
	"errors"
	"fmt"
	"sort"
)

type CourseManager struct {
	courses map[string]*Course
}

func NewCourseManager() *CourseManager {
	return &CourseManager{
		courses: make(map[string]*Course),
	}
}

// AddCourse adds a node to the graph
func (m *CourseManager) AddCourse(id, name string) error {
	if _, exists := m.courses[id]; exists {
		return fmt.Errorf("course ID %s already exists", id)
	}
	m.courses[id] = NewCourse(id, name)
	return nil
}

// AddPrerequisite adds a directed edge: courseID -> prerequisiteID
func (m *CourseManager) AddPrerequisite(courseID, prereqID string) error {
	if courseID == prereqID {
		return errors.New("a course cannot be its own prerequisite")
	}

	course, ok1 := m.courses[courseID]
	prereq, ok2 := m.courses[prereqID]

	if !ok1 || !ok2 {
		return errors.New("both courses must exist")
	}

	if course.PrereqIDs[prereqID] {
		return fmt.Errorf("%s is already a prerequisite for %s", prereqID, courseID)
	}

	// Cycle Detection: DFS to see if prereq already depends on course
	if m.hasPath(prereq, courseID) {
		return errors.New("cycle detected: invalid prerequisite chain")
	}

	course.PrereqIDs[prereqID] = true
	return nil
}

// hasPath checks if we can reach targetID starting from startNode (DFS)
func (m *CourseManager) hasPath(startNode *Course, targetID string) bool {
	if startNode.ID == targetID {
		return true
	}
	
	for nextID := range startNode.PrereqIDs {
		if nextNode, exists := m.courses[nextID]; exists {
			if m.hasPath(nextNode, targetID) {
				return true
			}
		}
	}
	return false
}

// RemoveCourse deletes a node and cleans up references
func (m *CourseManager) RemoveCourse(id string) error {
	if _, exists := m.courses[id]; !exists {
		return fmt.Errorf("course not found: %s", id)
	}

	// 1. Remove the course itself
	delete(m.courses, id)

	// 2. Scan all other courses to remove this ID from their prerequisites
	// (To maintain data integrity)
	for _, c := range m.courses {
		delete(c.PrereqIDs, id)
	}
	
	return nil
}

// ListPrerequisites returns ALL direct and indirect prerequisites
func (m *CourseManager) ListPrerequisites(courseID string) ([]string, error) {
	root, exists := m.courses[courseID]
	if !exists {
		return nil, fmt.Errorf("course not found: %s", courseID)
	}

	visited := make(map[string]bool)
	m.collectPrereqs(root, visited)

	// Convert map to sorted slice
	var result []string
	for id := range visited {
		// Don't include the course itself in the output
		if id != courseID {
			result = append(result, id)
		}
	}
	sort.Strings(result)
	return result, nil
}

// Helper for recursive collection
func (m *CourseManager) collectPrereqs(current *Course, visited map[string]bool) {
	for pid := range current.PrereqIDs {
		if !visited[pid] {
			visited[pid] = true
			if node, exists := m.courses[pid]; exists {
				m.collectPrereqs(node, visited)
			}
		}
	}
}

// CanEnroll checks if a student has completed all necessary courses
func (m *CourseManager) CanEnroll(courseID string, completed []string) (bool, error) {
	// Convert completed slice to map for O(1) lookup
	doneMap := make(map[string]bool)
	for _, c := range completed {
		doneMap[c] = true
	}

	needed, err := m.ListPrerequisites(courseID)
	if err != nil {
		return false, err
	}

	for _, req := range needed {
		if !doneMap[req] {
			return false, nil
		}
	}
	return true, nil
}