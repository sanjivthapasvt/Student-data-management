// Constants
const API_BASE_URL = "http://localhost:8000/api";
const AUTH_HEADER = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

// Utility functions
const handleApiError = (error, defaultMessage = "An error occurred") => {
  const errorMessage =
    error.response?.data?.detail || error.message || defaultMessage;
  console.error(defaultMessage + ":", error);
  return errorMessage;
};

const calculateAverage = (marks) => {
  const subjects = ["DSA", "Java", "SAD", "Web_technology", "Prob_and_Stats"];
  const total = subjects.reduce(
    (sum, subject) => sum + parseFloat(marks[subject] || 0),
    0
  );
  return (total / subjects.length).toFixed(2);
};

// API functions
const api = {
  async getMarks(studentId = "") {
    try {
      const url = `${API_BASE_URL}/students/marks/${studentId}`.replace(
        /\/$/,
        ""
      );
      const response = await axios.get(url, { headers: AUTH_HEADER() });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, "Error loading marks"));
    }
  },

  async createMarks(marksData) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/students/marks/`,
        marksData,
        { headers: AUTH_HEADER() }
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage || "Error creating marks");
    }
  },

  async updateMarks(studentId, marksData) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/students/marks/${studentId}/`,
        marksData,
        { headers: AUTH_HEADER() }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, "Error updating marks"));
    }
  },

  async deleteMarks(studentId) {
    try {
      await axios.delete(`${API_BASE_URL}/students/marks/${studentId}/`, {
        headers: AUTH_HEADER(),
      });
    } catch (error) {
      throw new Error(handleApiError(error, "Error deleting marks"));
    }
  },

  async getStudents() {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/`, {
        headers: AUTH_HEADER(),
      });
      return response.data; // e.g., [{ id: 1, name: "Alice", roll: "1234" }, ...]
    } catch (error) {
      throw new Error(handleApiError(error, "Error fetching students"));
    }
  },
};

// DOM Manipulation functions
const dom = {
  getElement: (id) => document.getElementById(id),

  createTableRow: (mark) => `
        <tr data-student-id="${mark.student.id}">
            <td>
                <div class="d-flex px-2 py-1">
                    <div class="d-flex flex-column justify-content-center">
                        <h6 class="mb-0 text-sm">${mark.student.name}</h6>
                        <p class="text-xs text-secondary mb-0">Roll: ${mark.student.roll}</p>
                    </div>
                </div>
            </td>
            <td><p class="text-xs font-weight-bold mb-0">${mark.DSA}</p></td>
            <td><p class="text-xs font-weight-bold mb-0">${mark.Java}</p></td>
            <td><p class="text-xs font-weight-bold mb-0">${mark.SAD}</p></td>
            <td><p class="text-xs font-weight-bold mb-0">${mark.Web_technology}</p></td>
            <td><p class="text-xs font-weight-bold mb-0">${mark.Prob_and_Stats}</p></td>
            <td><p class="text-xs font-weight-bold mb-0">${mark.percentage}%</p></td>
            <td class="align-middle">
                <button class="btn btn-link text-secondary mb-0 edit-marks-btn">
                    <i class="material-symbols-rounded text-sm me-2">edit</i>Edit
                </button>
                <button class="btn btn-link text-danger mb-0 delete-marks-btn">
                    <i class="material-symbols-rounded text-sm me-2">delete</i>Delete
                </button>
            </td>
        </tr>
    `,

  showError: (message) => {
    const tableBody = dom.getElement("marksheetTableBody");
    tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">${message}</td>
            </tr>
        `;
  },
};

// Main functionality
class MarksManager {
  constructor() {
    this.modal = null;
    this.setupEventListeners();
    this.loadMarks();
  }

  async loadMarks() {
    try {
      const marks = await api.getMarks();
      const tableBody = dom.getElement("marksheetTableBody");
      tableBody.innerHTML = marks
        .map((mark) => dom.createTableRow(mark))
        .join("");
    } catch (error) {
      dom.showError(error.message);
    }
  }
  // New method to fetch all students and populate the dropdown
  async loadStudentsDropdown() {
    try {
      const students = await api.getStudents();
      const studentSelect = dom.getElement("studentSelect");
      // Clear existing options
      studentSelect.innerHTML = "";
      // Add a default placeholder
      studentSelect.innerHTML =
        '<option value="">-- Select a Student --</option>';

      // Populate with student options
      students.forEach((student) => {
        const option = document.createElement("option");
        option.value = student.id;
        option.textContent = `${student.name} (${student.roll})`;
        studentSelect.appendChild(option);
      });
    } catch (error) {
      alert(error.message);
    }
  }
  setupEventListeners() {
    // Add new marks button
    const addButton = `
            <div class="col-12 text-end mb-4">
                <button class="btn bg-gradient-dark mb-0" id="addMarksBtn">
                    <i class="material-symbols-rounded">add</i> Add New Marks
                </button>
            </div>
        `;
    document
      .querySelector(".container-fluid .row")
      .insertAdjacentHTML("afterbegin", addButton);

    // Event listeners
    document.addEventListener("DOMContentLoaded", () => {
      this.modal = new bootstrap.Modal(dom.getElement("marksModal"));
      dom
        .getElement("addMarksBtn")
        .addEventListener("click", () => this.createMarks());
    });

    dom.getElement("marksheetTableBody").addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      if (!row) return;

      const studentId = row.dataset.studentId;
      if (e.target.closest(".edit-marks-btn")) {
        this.editMarks(studentId);
      } else if (e.target.closest(".delete-marks-btn")) {
        this.deleteMarks(studentId);
      }
    });

    dom
      .getElement("marksForm")
      .addEventListener("submit", (e) => this.handleFormSubmit(e));
    dom
      .getElement("search")
      .addEventListener("input", (e) => this.handleSearch(e));
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const studentId = dom.getElement("studentId").value;
    const selectedStudentId = dom.getElement("studentSelect").value;
  
    const marksData = {
      student_id: studentId || selectedStudentId, // Add this line
      DSA: parseFloat(form.dsa.value),
      Java: parseFloat(form.java.value),
      SAD: parseFloat(form.sad.value),
      Web_technology: parseFloat(form.webTech.value),
      Prob_and_Stats: parseFloat(form.probStats.value)
    };
  
    try {
      if (studentId) {
        await api.updateMarks(studentId, marksData);
      } else {
        if (!selectedStudentId) {
          throw new Error("Please select a student");
        }
        await api.createMarks(marksData);
      }
  
      this.modal.hide();
      await this.loadMarks();
      alert(studentId ? "Marks updated successfully" : "Marks added successfully");
    } catch (error) {
      alert(error.message);
    }
  }

  handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll("#marksheetTableBody tr");

    rows.forEach((row) => {
      const studentName =
        row.querySelector("h6")?.textContent.toLowerCase() || "";
      const studentRoll =
        row.querySelector("p")?.textContent.toLowerCase() || "";

      row.style.display =
        studentName.includes(searchTerm) || studentRoll.includes(searchTerm)
          ? ""
          : "none";
    });
  }

  createMarks() {
    dom.getElement("marksModalLabel").textContent = "Add New Marks";

    // Reset form
    dom.getElement("marksForm").reset();
    dom.getElement("studentId").value = "";

    // Show dropdown, hide read-only info
    dom.getElement("studentSelectGroup").style.display = "";
    dom.getElement("studentInfoGroup").style.display = "none";

    // Load the dropdown with all students
    this.loadStudentsDropdown();

    // Show the modal

    this.modal.show();
  }

  async editMarks(studentId) {
    try {
        const marksData = await api.getMarks(studentId);
        const marks = Array.isArray(marksData) ? marksData[0] : marksData;

        // Set modal title and student ID
        dom.getElement('marksModalLabel').textContent = 'Edit Marks';
        dom.getElement('studentId').value = studentId;

        // Set student info in read-only field
        dom.getElement('studentInfo').value = `${marks.student.name} (Roll: ${marks.student.roll})`;
        
        // Populate marks fields
        dom.getElement('dsa').value = marks.DSA;
        dom.getElement('java').value = marks.Java;
        dom.getElement('sad').value = marks.SAD;
        dom.getElement('webTech').value = marks.Web_technology;
        dom.getElement('probStats').value = marks.Prob_and_Stats;

        // Hide dropdown, show read-only info
        dom.getElement('studentSelectGroup').style.display = 'none';
        dom.getElement('studentInfoGroup').style.display = '';
        dom.getElement('studentInfoGroup').classList.add('is-filled');

        this.modal.show();
    } catch (error) {
        alert(error.message);
    }
}
  
  

  async deleteMarks(studentId) {
    if (confirm("Are you sure you want to delete these marks?")) {
      try {
        await api.deleteMarks(studentId);
        await this.loadMarks();
        alert("Marks deleted successfully");
      } catch (error) {
        alert(error.message);
      }
    }
  }
}

// Initialize the application
new MarksManager();
