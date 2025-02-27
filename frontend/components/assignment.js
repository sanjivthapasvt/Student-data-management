// ../assets/js/assignment.js

class StudentService {
  constructor() {
      this.API_URL = "http://localhost:8000/api/";
  }

  async getStudents() {
      try {
          const token = localStorage.getItem("accessToken");
          if (!token) throw new Error("No access token found");
          const response = await axios.get(`${this.API_URL}students/`, {
              headers: { Authorization: `Bearer ${token}` },
          });
          return response.data;
      } catch (error) {
          console.error("Error fetching students:", error);
          throw error;
      }
  }

  // Other methods (deleteStudent, updateStudent, createStudent, getStudent) remain unchanged
}

const studentService = new StudentService();

document.addEventListener("DOMContentLoaded", async function () {
  let assignments = [];

  const progressText = document.getElementById("progress-text");
  const progressBar = document.querySelector(".progress");
  const tbody = document.getElementById("assignment-data");
  const selectAllCheckbox = document.getElementById("select-all");

  // Load saved assignments from localStorage (if any)
  function loadSavedAssignments() {
      const saved = localStorage.getItem('assignments');
      if (saved) {
          assignments = JSON.parse(saved);
          renderAssignments();
          updateProgress();
      }
  }

  async function fetchStudents() {
      try {
          const students = await studentService.getStudents();
          assignments = students.map(student => ({
              lastName: student.name.split(' ').slice(0, -1).join(' ') || '',
              firstName: student.name.split(' ').pop() || '',
              dsa: false,
              statistics: false,
              java: false,
              sad: false,
              webTech: false,
              turnedIn: false
          }));
          // Merge with saved assignments if they exist
          const saved = JSON.parse(localStorage.getItem('assignments') || '[]');
          if (saved.length > 0) {
              assignments.forEach((assignment, index) => {
                  const savedAssignment = saved.find(s => s.lastName === assignment.lastName && s.firstName === assignment.firstName);
                  if (savedAssignment) {
                      Object.assign(assignment, savedAssignment);
                  }
              });
          }
          renderAssignments();
          updateProgress();
      } catch (error) {
          const errorMessage = error.response?.data?.detail || error.message;
          console.error('Error fetching students:', error);
          alert(`Fail to load students: ${errorMessage}`);
          if (error.response?.status === 401) {
              localStorage.removeItem('accessToken');
              window.location.href = 'sign-in.html';
          }
      }
  }

  function checkForNewStudent() {
      const newStudentTimestamp = localStorage.getItem('newStudentCreated');
      if (newStudentTimestamp) {
          fetchStudents();
          localStorage.removeItem('newStudentCreated');
      }
  }

  // Initial load
  fetchStudents();
  loadSavedAssignments(); // Load any previously saved data
  checkForNewStudent();
  setInterval(() => {
      fetchStudents();
      checkForNewStudent();
  }, 30000);

  function updateProgress() {
      if (!progressText || !progressBar) {
          console.error('Progress elements not found in DOM');
          return;
      }
      const turnedInCount = assignments.filter(a => a.turnedIn).length;
      const totalCount = assignments.length;
      const percentage = (totalCount > 0) ? (turnedInCount / totalCount) * 100 : 0;
      progressText.textContent = `${turnedInCount}/${totalCount} students have turned in assignment`;
      progressBar.style.width = `${percentage}%`;
  }

  function renderAssignments() {
      if (!tbody) {
          console.error('Table body not found in DOM');
          return;
      }
      tbody.innerHTML = "";
      assignments.forEach((assignment, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td class="checkbox-cell"><input type="checkbox" ${assignment.turnedIn ? "checked" : ""} data-index="${index}"></td>
              <td>${assignment.lastName}</td>
              <td>${assignment.firstName}</td>
              <td class="checkbox-cell"><input type="checkbox" ${assignment.dsa ? "checked" : ""} data-student="${index}" data-subject="dsa"></td>
              <td class="checkbox-cell"><input type="checkbox" ${assignment.statistics ? "checked" : ""} data-student="${index}" data-subject="statistics"></td>
              <td class="checkbox-cell"><input type="checkbox" ${assignment.java ? "checked" : ""} data-student="${index}" data-subject="java"></td>
              <td class="checkbox-cell"><input type="checkbox" ${assignment.sad ? "checked" : ""} data-student="${index}" data-subject="sad"></td>
              <td class="checkbox-cell"><input type="checkbox" ${assignment.webTech ? "checked" : ""} data-student="${index}" data-subject="webTech"></td>
              <td class="checkbox-cell"><input type="checkbox" ${isAllSubjectsChecked(index) ? "checked" : ""} data-index="${index}" class="total-checkbox" disabled></td>
          `;
          tbody.appendChild(row);
      });
      attachEventListeners();
  }

  function isAllSubjectsChecked(studentIndex) {
      if (studentIndex < 0 || studentIndex >= assignments.length) {
          console.error('Invalid student index:', studentIndex);
          return false;
      }
      const student = assignments[studentIndex];
      return student.dsa && student.statistics && student.java && student.sad && student.webTech;
  }

  function updateStudentTurnedIn(studentIndex) {
      if (studentIndex < 0 || studentIndex >= assignments.length) {
          console.error('Invalid student index:', studentIndex);
          return;
      }
      assignments[studentIndex].turnedIn = isAllSubjectsChecked(studentIndex);
      renderAssignments();
      updateProgress();
  }

  function attachEventListeners() {
      if (!selectAllCheckbox) {
          console.error('Select All checkbox not found in DOM');
          return;
      }
      document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
          checkbox.addEventListener("change", function () {
              if (this.className === "total-checkbox") return;
              const studentIndex = this.getAttribute("data-student") || this.getAttribute("data-index");
              const subject = this.getAttribute("data-subject");
              if (!studentIndex) {
                  console.error('No student index found on checkbox');
                  return;
              }
              if (subject) {
                  assignments[studentIndex][subject] = this.checked;
              } else if (this.id !== "select-all") {
                  assignments[studentIndex].turnedIn = this.checked;
              }
              updateStudentTurnedIn(parseInt(studentIndex, 10));
          });
      });

      selectAllCheckbox.addEventListener("change", function () {
          assignments.forEach((_, index) => {
              assignments[index].turnedIn = this.checked;
              assignments[index].dsa = this.checked;
              assignments[index].statistics = this.checked;
              assignments[index].java = this.checked;
              assignments[index].sad = this.checked;
              assignments[index].webTech = this.checked;
          });
          renderAssignments();
          updateProgress();
      });
  }

  // Save All Assignments to localStorage
  function saveAllAssignments() {
      try {
          localStorage.setItem('assignments', JSON.stringify(assignments));
          alert("All assignments saved successfully!");
      } catch (error) {
          console.error('Error saving assignments:', error);
          alert("Failed to save assignments.");
      }
  }

  // Button Functions
  function viewClassReports() {
      alert("View Class Reports clicked!");
  }

  function downloadAssignmentReport() {
      alert("Download Assignment Report clicked!");
  }

  function downloadCurrentDraft() {
      alert("Download Current Draft clicked!");
  }

  // Expose saveAllAssignments to global scope for onclick
  window.saveAllAssignments = saveAllAssignments;
});