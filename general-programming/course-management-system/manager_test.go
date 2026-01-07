package main

import (
	"reflect"
	"testing"
)

func TestCycleDetection(t *testing.T) {
	cm := NewCourseManager()
	_ = cm.AddCourse("A", "Course A")
	_ = cm.AddCourse("B", "Course B")
	_ = cm.AddCourse("C", "Course C")

	// Chain: A -> B -> C
	_ = cm.AddPrerequisite("A", "B")
	_ = cm.AddPrerequisite("B", "C")

	// Attempt Cycle: C -> A (Should fail)
	err := cm.AddPrerequisite("C", "A")
	if err == nil {
		t.Error("Failed to detect cycle A->B->C->A")
	}
}

func TestListPrerequisites(t *testing.T) {
	cm := NewCourseManager()
	// Setup CS301 -> CS201 -> CS101
	_ = cm.AddCourse("CS101", "Intro")
	_ = cm.AddCourse("CS201", "Data Structures")
	_ = cm.AddCourse("CS301", "Algo")
	
	_ = cm.AddPrerequisite("CS201", "CS101")
	_ = cm.AddPrerequisite("CS301", "CS201")

	expected := []string{"CS101", "CS201"}
	result, _ := cm.ListPrerequisites("CS301")

	if !reflect.DeepEqual(result, expected) {
		t.Errorf("got %v, want %v", result, expected)
	}
}

func TestCanEnroll(t *testing.T) {
	cm := NewCourseManager()
	_ = cm.AddCourse("Top", "Top")
	_ = cm.AddCourse("Mid", "Mid")
	_ = cm.AddCourse("Bot", "Bot")

	_ = cm.AddPrerequisite("Top", "Mid")
	_ = cm.AddPrerequisite("Mid", "Bot")

	// Needs Mid and Bot
	ok, _ := cm.CanEnroll("Top", []string{"Mid", "Bot"})
	if !ok {
		t.Error("Should be able to enroll with all prereqs met")
	}

	ok, _ = cm.CanEnroll("Top", []string{"Mid"})
	if ok {
		t.Error("Should NOT enroll, missing 'Bot' (indirect prereq)")
	}
}