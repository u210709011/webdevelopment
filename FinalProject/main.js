// temporary arrays
let courses = [];
let students = [];

document.addEventListener("DOMContentLoaded", function () {
  // makes parts visibile
  function makeVisible(sectionId) {
    const section = document.getElementById(sectionId);
    if (section.style.display === "none") {
      section.style.display = "block";
    } else {
      section.style.display = "none";
    }
  }

  // adds course
  function addCourse() {
    const courseName = document.getElementById("course-name").value;

    // if the trimmed course name is not empty adds the course
    if (courseName.trim() !== "") {
      const course = { name: courseName, gradingScale: getGrade() };
      courses.push(course);

      addDropdown();

      // resets the form
      document.getElementById("course-form").reset();
    }

    // makes visible
    makeVisible("add-course");
  }

  // determines the grading
  function getGrade() {
    const gradingScaleInput = document.getElementById("grading-scale").value;
    if (gradingScaleInput === "10-point") {
      return { A: 90, B: 80, C: 70, D: 60, F: 0 };
    } else if (gradingScaleInput === "7-point") {
      return { A: 93, B: 85, C: 77, D: 70, F: 0 };
    }
  }

  // adds student
  function addStudent() {
    const courseId = document.getElementById("course-dropdown").value;
    const studentId = document.getElementById("student-id").value;
    const studentName = document.getElementById("student-name").value;
    const midtermScore = parseFloat(document.getElementById("midterm-score").value);
    const finalScore = parseFloat(document.getElementById("final-score").value);
    if (midtermScore > 100 || midtermScore < 0) {
      alert("Midterm note should be between 0 and 100")
      return;
    }
    if (finalScore > 100 || finalScore < 0) {
      alert("Final note should be between 0 and 100")
      return;
    }

    // checks if the required fields are empty
    if (
      courseId &&
      studentId.trim() !== "" &&
      studentName.trim() !== "" &&
      !isNaN(midtermScore) &&
      !isNaN(finalScore)
    ) {
      const course = courses.find((course) => course.name === courseId);

      // calculates the total score
      const totalScore = midtermScore * 0.4 + finalScore * 0.6;

      // determines the grade based on the grading system
      const gradingScale = course.gradingScale;

      // default grade
      let grade = "F";

      // forEach iterates objects
      for (const letterGrade in gradingScale) {
        const lowerBound = gradingScale[letterGrade];
        if (totalScore > lowerBound) {
          grade = letterGrade;
          break;
        }
      }

      // stores student information
      const student = {
        id: studentId,
        name: studentName,
        courseId,
        midtermScore,
        finalScore,
        totalScore,
        grade,
      };

      // adds to students
      students.push(student);

      // updates the scores table
      updateScoresTable();

      // cleas the form
      document.getElementById("student-form").reset();
    }

    // toggles on the visibility of the "Add Student" section
    makeVisible("add-student");
  }

  // updates the scores table
  function updateScoresTable() {
    const courseId = document.getElementById("course-dropdown").value;
    const filterOption = document.getElementById("filter-option").value;
    const table = document.getElementById("scores-table");
    const gradingScale = getGrade();
    // adds empty table
    table.innerHTML = "";

    // filters students based on the selected course
    const courseStudents = students.filter(
      (student) => student.courseId === courseId
    );

    // determine which filter to apply
    let filteredStudents;
    if (filterOption === "Passed") {
      filteredStudents = courseStudents.filter(
        (student) => student.grade !== "F"
      );
    } else if (filterOption === "Failed") {
      filteredStudents = courseStudents.filter(
        (student) => student.grade === "F"
      );
    } else {
      filteredStudents = courseStudents;
    }

    // determines table headers
    const headerRow = table.insertRow(0);
    const headers = [
      "Student ID",
      "Student Name",
      "Midterm Score",
      "Final Score",
      "Total Score",
      "Grade",
      "Actions",
    ];

    // adds headers
    for (let i = 0; i < headers.length; i++) {
      const cell = headerRow.insertCell(i);
      cell.textContent = headers[i];
    }

    // determine student data
    filteredStudents.forEach((student, index) => {
      const row = table.insertRow(index + 1);
      const cells = [
        student.id,
        student.name,
        student.midtermScore,
        student.finalScore,
        student.totalScore,
        student.grade,
      ];

      // add student data to the table
      cells.forEach((cellData, cellIndex) => {
        const cell = row.insertCell(cellIndex);
        cell.textContent = cellData;
      });

      // adds update button
      const updateButton = document.createElement("button");
      updateButton.textContent = "Update";
      updateButton.addEventListener("click", function () {
        // open prompt for midterm input
        const updatedMidtermScore = parseFloat(
          prompt("Enter the updated midterm score:")
        );
        // open prompt for final input
        const updatedFinalScore = parseFloat(
          prompt("Enter the updated final score:")
        );
        student.midtermScore = updatedMidtermScore;
        student.finalScore = updatedFinalScore;

        // calculates the total score and grade again
        student.totalScore =
          updatedMidtermScore * 0.4 + updatedFinalScore * 0.6;

        // find the correct grade
        for (const letterGrade in gradingScale) {
            const upperBound = gradingScale[letterGrade];
            if (student.totalScore < upperBound) {
              student.grade = letterGrade;
              break;
            }
          }
          

        // updates the scores table
        updateScoresTable();
      });

      // adds delete button
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", function () {
        // opens prompt to confirm the deletion
        const confirmDelete = confirm(
          "Are you sure you want to delete this student?"
        );

        if (confirmDelete) {
          // deletes the student
          let studentIndex = -1;
          for (let i = 0; i < students.length; i++) {
            if (students[i].id === student.id) {
              studentIndex = i;
              break;
            }
          }
          students.splice(studentIndex, 1);

          // updates the scores table
          updateScoresTable();
        }
      });

      row.insertCell(headers.length - 1).appendChild(updateButton);
      actionsCell = row
        .insertCell(headers.length - 1)
        .appendChild(deleteButton);
    });
  }

  // adds to the course dropdown
  function addDropdown() {
    const dropdown = document.getElementById("course-dropdown");
    dropdown.innerHTML =
      '<option value="" disabled selected>Select Course</option>';

    // adds each course as an option
    courses.forEach((course) => {
      const option = document.createElement("option");
      option.value = course.name;
      option.textContent = course.name;
      dropdown.appendChild(option);
    });
  }

  // searches for a student by name
  function searchStudent() {
    const searchName = document
      .getElementById("search-name")
      .value.toLowerCase();
    const table = document.getElementById("search-results-table");
    table.innerHTML = "";

    // filters students by name
    const matchingStudents = students.filter((student) =>
      student.name.toLowerCase().includes(searchName)
    );

    // determines headers
    const headerRow = table.insertRow(0);
    const headers = [
      "Student Name",
      "Course Name",
      "Midterm Score",
      "Final Score",
      "Total Score",
      "Grade",
      "GPA",
    ];

    // adds headers

    for (let i = 0; i < headers.length; i++) {
      const cell = headerRow.insertCell(i);
      cell.textContent = headers[i];
    }

    // adds searched student's data to the table
    matchingStudents.forEach((student, index) => {
      const row = table.insertRow(index + 1);
      const cells = [
        student.name,
        getCourseName(student.courseId),
        student.midtermScore,
        student.finalScore,
        student.totalScore,
        student.grade,
      ];

      // inserts to cells
      cells.forEach((cellData, cellIndex) => {
        const cell = row.insertCell(cellIndex);
        cell.textContent = cellData;
      });

      const gpaCell = row.insertCell(headers.length - 1);
      const studentLectures = [];

      // adds to lectures
      for (let i = 0; i < students.length; i++) {
        if (students[i].id === student.id) {
          studentLectures.push(students[i]);
        }
      }

      // calculates GPA
      const totalGPA = calculateTotalGPA(studentLectures);
      gpaCell.textContent = totalGPA.toFixed(2);
    });
  }

  // gets the name using ID
  function getCourseName(courseId) {
    for (let i = 0; i < courses.length; i++) {
      if (courses[i].name === courseId) {
        return courses[i].name;
      }
    }
    return "N/A";
  }

  // filters students
  function filterStudentsByGrade(grade, courseId) {
    const courseStudents = [];
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      if (student.courseId === courseId) {
        courseStudents.push(student);
      }
    }

    if (grade === "Passed") {
      return courseStudents.filter((student) => student.grade !== "F");
    } else if (grade === "Failed") {
      return courseStudents.filter((student) => student.grade === "F");
    } else {
      return courseStudents;
    }
  }

  // returns passed/failed students and meanscore
  function getDetailedStatistics(courseId) {
    //gets all students in the course
    const courseStudents = [];
    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      if (student.courseId === courseId) {
        courseStudents.push(student);
      }
    }

    // gets passed students
    const passedStudents = [];
    for (let i = 0; i < courseStudents.length; i++) {
      const student = courseStudents[i];

      if (student.grade !== "F") {
        passedStudents.push(student);
      }
    }

    // gets failed students
    const failedStudents = [];
    for (let i = 0; i < courseStudents.length; i++) {
      const student = courseStudents[i];

      if (student.grade === "F") {
        failedStudents.push(student);
      }
    }

    // calculates mean score
    const meanScore = calculateMeanScore(courseStudents);

    return {
      passedStudents: passedStudents.length,
      failedStudents: failedStudents.length,
      meanScore: meanScore.toFixed(2),
    };
  }

  // calculates mean score
  function calculateMeanScore(students) {
    if (students.length === 0) {
      return 0;
    }

    const totalScore = students.reduce(
      (sum, student) => sum + student.totalScore,
      0
    );
    return totalScore / students.length;
  }

  // calculates GPA
  function calculateTotalGPA(studentLectures) {
    const maxScore = 100;
    let totalScore = 0;

    for (let i = 0; i < studentLectures.length; i++) {
      const lecture = studentLectures[i];
      totalScore += lecture.totalScore;
    }

    const averageScore = totalScore / studentLectures.length;
    const gpa = (averageScore / maxScore) * 4;

    return gpa;
  }

  // event listeners for buttons
  document
    .getElementById("add-course-button")
    .addEventListener("click", function () {
      makeVisible("add-course");
    });

  document
    .getElementById("add-student-button")
    .addEventListener("click", function () {
      makeVisible("add-student");
    });

  document
    .getElementById("add-course-submit-button")
    .addEventListener("click", addCourse);

  document
    .getElementById("add-student-submit-button")
    .addEventListener("click", addStudent);

  document
    .getElementById("course-dropdown")
    .addEventListener("change", updateScoresTable);

  document
    .getElementById("search-button")
    .addEventListener("click", searchStudent);

  document
    .getElementById("detailed-statistics-button")
    .addEventListener("click", function () {
      const courseId = document.getElementById("course-dropdown").value;
      const detailedStatistics = getDetailedStatistics(courseId);
      alert(
        `Detailed Statistics:\n\nPassed Students: ${detailedStatistics.passedStudents}\nFailed Students: ${detailedStatistics.failedStudents}\nMean Score: ${detailedStatistics.meanScore}`
      );
    });

  document
    .getElementById("filter-students-button")
    .addEventListener("click", function () {
      const courseId = document.getElementById("course-dropdown").value;
      const filterOption = document.getElementById("filter-option").value;
      const filteredStudents = filterStudentsByGrade(filterOption, courseId);
      updateScoresTable(filteredStudents);
    });

  addDropdown();
});
