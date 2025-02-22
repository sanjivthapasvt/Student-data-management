// ../assets/js/assignment.js (for Assignment.html)

// Define StudentService class
class StudentService {
    constructor() {
      this.API_URL = "http://localhost:8000/api/";
    }
  
    // For viewing students
    async getStudents() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("No access token found");
        }
        const response = await axios.get(`${this.API_URL}students/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching students:", error);
        throw error;
      }
    }
  
    // For deleting students (optional, if needed later)
    async deleteStudent(id) {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.delete(`${this.API_URL}students/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error) {
        console.error("Error deleting student:", error);
        throw error;
      }
    }
  
    // For editing students (optional, if needed later)
    async updateStudent(id, data) {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.put(`${this.API_URL}students/${id}/`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      } catch (error) {
        console.error("Error updating student:", error);
        throw error;
      }
    }
  
    // For creating students (optional, if needed later)
    async createStudent(data) {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.post(`${this.API_URL}students/`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      } catch (error) {
        console.error("Error creating student:", error);
        throw error;
      }
    }
  
    // For getting student details (optional, if needed later)
    async getStudent(id) {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${this.API_URL}students/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching student:", error);
        throw error;
      }
    }
  }
  
  const studentService = new StudentService();
  
  document.addEventListener("DOMContentLoaded", async function () {
    let assignments = []; // Store student assignment data
  
    // DOM elements
    const progressText = document.getElementById("progress-text");
    const progressBar = document.querySelector(".progress");
    const tbody = document.getElementById("assignment-data");
    const selectAllCheckbox = document.getElementById("select-all");
  
    // Fetch students from backend and initialize assignments
    async function fetchStudents() {
      try {
        const students = await studentService.getStudents();
        assignments = students.map(student => ({
          lastName: student.name.split(' ').slice(0, -1).join(' ') || '', // Last name(s)
          firstName: student.name.split(' ').pop() || '', // First name
          dsa: false, // Default to false (not submitted)
          statistics: false,
          java: false,
          sad: false,
          webTech: false,
          turnedIn: false // Default to false, update based on subject submissions
        }));
  
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
  
    // Check for new student notification from Dashboard
    function checkForNewStudent() {
      const newStudentTimestamp = localStorage.getItem('newStudentCreated');
      if (newStudentTimestamp) {
        fetchStudents(); // Refresh assignments when a new student is created
        localStorage.removeItem('newStudentCreated'); // Clear the notification
      }
    }
  
    // Initial fetch and setup polling
    fetchStudents();
    checkForNewStudent(); // Check immediately on load
    setInterval(() => {
      fetchStudents(); // Poll every 30 seconds
      checkForNewStudent(); // Check for new student notifications during polling
    }, 30000); // Adjust polling interval as needed
  
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
          <td class="checkbox-cell">
            <input type="checkbox" ${assignment.turnedIn ? "checked" : ""} data-index="${index}">
          </td>
          <td>${assignment.lastName}</td>
          <td>${assignment.firstName}</td>
          <td class="checkbox-cell">
            <input type="checkbox" ${assignment.dsa ? "checked" : ""} data-student="${index}" data-subject="dsa">
          </td>
          <td class="checkbox-cell">
            <input type="checkbox" ${assignment.statistics ? "checked" : ""} data-student="${index}" data-subject="statistics">
          </td>
          <td class="checkbox-cell">
            <input type="checkbox" ${assignment.java ? "checked" : ""} data-student="${index}" data-subject="java">
          </td>
          <td class="checkbox-cell">
            <input type="checkbox" ${assignment.sad ? "checked" : ""} data-student="${index}" data-subject="sad">
          </td>
          <td class="checkbox-cell">
            <input type="checkbox" ${assignment.webTech ? "checked" : ""} data-student="${index}" data-subject="webTech">
          </td>
          <td class="checkbox-cell">
            <input type="checkbox" ${isAllSubjectsChecked(index) ? "checked" : ""} data-index="${index}" class="total-checkbox" disabled>
          </td>
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
          if (this.className === "total-checkbox") return; // Ignore Total checkbox changes
  
          const studentIndex = this.getAttribute("data-student") || this.getAttribute("data-index");
          const subject = this.getAttribute("data-subject");
  
          if (!studentIndex) {
            console.error('No student index found on checkbox');
            return;
          }
  
          if (subject) {
            // Update subject-specific checkbox
            assignments[studentIndex][subject] = this.checked;
          } else if (this.id !== "select-all") {
            // Update student-level checkbox
            assignments[studentIndex].turnedIn = this.checked;
          }
  
          updateStudentTurnedIn(parseInt(studentIndex, 10));
        });
      });
  
      // Select All Checkbox
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
  
    // Button Functions (placeholders)
    function viewClassReports() {
      alert("View Class Reports clicked!");
    }
  
    function downloadAssignmentReport() {
      alert("Download Assignment Report clicked!");
    }
  
    function downloadCurrentDraft() {
      alert("Download Current Draft clicked!");
    }
  });