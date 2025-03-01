/**
 * Base configuration and authentication
 */
const API_BASE_URL = "http://localhost:8000/api";
const AUTH_HEADER = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

/**
 * Utility Functions
 */

// Handles API errors and returns formatted error messages
const handleApiError = (error, defaultMessage = "An error occurred") => {
  const errorMessage =
    error.response?.data?.detail || error.message || defaultMessage;
  console.error(defaultMessage + ":", error);
  return errorMessage;
};

// Calculates the average marks across all subjects
const calculateAverage = (marks) => {
  const subjects = ["DSA", "Java", "SAD", "Web_technology", "Prob_and_Stats"];
  const total = subjects.reduce(
    (sum, subject) => sum + parseFloat(marks[subject] || 0),
    0
  );
  return (total / subjects.length).toFixed(2);
};

/**
 * API Integration Methods
 * Handles all CRUD operations with the backend
 */
const api = {
  // Fetches marks for all students or a specific student
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

  // Creates new marks entry for a student
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

  // Updates existing marks for a student
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

  // Deletes marks for a specific student
  async deleteMarks(studentId) {
    try {
      await axios.delete(`${API_BASE_URL}/students/marks/${studentId}/`, {
        headers: AUTH_HEADER(),
      });
    } catch (error) {
      throw new Error(handleApiError(error, "Error deleting marks"));
    }
  },

  // Fetches list of all students
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

/**
 * DOM Manipulation Helper Functions
 * Centralizes all DOM-related operations
 */
const dom = {
  // Shorthand for getElementById
  getElement: (id) => document.getElementById(id),

  // Generates HTML for table rows
  createTableRow: (mark) => `
        <tr data-student-id="${mark.student.id}">
            <td>
                <div class="d-flex px-2 py-1">
                    <div class="d-flex flex-column justify-content-center">
                        <h6 class="mb-0 text-sm ">${mark.student.name}</h6>
                        <p class="text-xs text-secondary mb-0 ">Roll: ${mark.student.roll}</p>
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

  // Displays error messages in the table
  showError: (message) => {
    const tableBody = dom.getElement("marksheetTableBody");
    tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">${message}</td>
            </tr>
        `;
  },
};

/**
 * Main Application Class
 * Manages all marksheet operations and UI interactions
 */
class MarksManager {
  constructor() {
    this.modal = null;
    this.setupEventListeners();
    this.loadMarks();
  }

  /**
   * Fetches and displays all marks in the table
   */
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

  /**
   * Populates student dropdown with all available students
   */
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
      showNotification(error.message, "danger");
    }
  }

  /**
   * Sets up all event listeners for the application
   * Includes: form submission, search, modal interactions
   */
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

    // Add input event listeners for is-filled class
    document.querySelectorAll('.input-group input').forEach(input => {
      input.addEventListener('focus', (e) => {
          e.target.closest('.input-group').classList.add('is-filled');
      });

      input.addEventListener('blur', (e) => {
          if (!e.target.value) {
              e.target.closest('.input-group').classList.remove('is-filled');
          }
      });

      input.addEventListener('input', (e) => {
          const group = e.target.closest('.input-group');
          if (e.target.value) {
              group.classList.add('is-filled');
          } else {
              group.classList.remove('is-filled');
          }
      });
    });
  }

  /**
   * Handles form submission for both creating and updating marks
   * @param {Event} e - Form submission event
   */
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
      showNotification(studentId ? "Marks updated successfully" : "Marks added successfully", "success");
    } catch (error) {
      showNotification(error.message, "danger");
    }
  }

  /**
   * Implements search functionality across student names and roll numbers
   * @param {Event} e - Input event from search field
   */
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

  /**
   * Prepares and shows modal for creating new marks
   * Resets form and loads student dropdown
   */
  createMarks() {
    dom.getElement("marksModalLabel").textContent = "Add New Marks";

    // Reset form
    dom.getElement("marksForm").reset();
    dom.getElement("studentId").value = "";

    // Show dropdown, hide read-only info
    dom.getElement("studentSelectGroup").style.display = "";
    dom.getElement("studentInfoGroup").style.display = "none";

    // Remove is-filled class from all input groups
    document.querySelectorAll('.input-group').forEach(group => {
        group.classList.remove('is-filled');
    });

    // Load the dropdown with all students
    this.loadStudentsDropdown();

    this.modal.show();
  }

  /**
   * Loads and displays existing marks for editing
   * @param {string} studentId - ID of student whose marks are being edited
   */
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

        // Add is-filled class to all input groups with values
        document.querySelectorAll('.input-group').forEach(group => {
            const input = group.querySelector('input');
            if (input && input.value) {
                group.classList.add('is-filled');
            }
        });

        // Hide dropdown, show read-only info
        dom.getElement('studentSelectGroup').style.display = 'none';
        dom.getElement('studentInfoGroup').style.display = '';
        dom.getElement('studentInfoGroup').classList.add('is-filled');

        this.modal.show();
    } catch (error) {
      showNotification(error.message, "danger");
    }
}
  
  /**
   * Handles mark deletion with confirmation
   * @param {string} studentId - ID of student whose marks are being deleted
   */
  async deleteMarks(studentId) {
    if (confirm("Are you sure you want to delete these marks?")) {
      try {
        await api.deleteMarks(studentId);
        await this.loadMarks();
        showNotification("Marks deleted successfully", "success");
      } catch (error) {
        showNotification(error.message, "danger");
      }
    }
  }
}

// Initialize the application
new MarksManager();
