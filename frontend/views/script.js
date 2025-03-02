const toastr = require("toastr")
class StudentService {
  constructor() {
    this.API_URL = "http://localhost:8000/api/";
  }
//for viewing students
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
//for deleting students
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
//for editing students
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
//for creating students
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

//for getting student details
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

document.addEventListener("DOMContentLoaded", () => {
  loadStudents();
  document
    .getElementById("createStudentForm")
    ?.addEventListener("submit", handleCreateStudent);
  document
    .getElementById("editStudentForm")
    ?.addEventListener("submit", handleEditStudent);

  // Add search input event listener with debouncing
  const searchInput = document.getElementById('search');
  let searchTimeout;
  
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      handleSearch(e.target.value);
    }, 300);
  });
});

async function loadStudents() {
  const container = document.getElementById("studentCardsContainer");
  container.innerHTML = '<div class="text-center">Loading students...</div>';
  try {
    const students = await studentService.getStudents();
    if (!students || students.length === 0) {
      container.innerHTML = '<div class="text-center">No students found</div>';
      return;
    }
    container.innerHTML = students
      .map((student) => createStudentCard(student))
      .join("");
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message;
    container.innerHTML = `<div class="alert alert-danger">Error loading students: ${errorMessage}</div>`;
    //force logout if unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "sign-in.html";
    }
  }
}

// Create a student card HTML element
function createStudentCard(student) {
  // Get the backend URL from your config or environment
  const BACKEND_URL = 'http://localhost:8000/api';
  
  return `
    <div class="student-card" id="student-${student.id}">
      <img 
        src="${student.photo ? `${BACKEND_URL}${student.photo}` : '../assets/img/placeholder.jpg'}" 
        alt="Student Photo" 
        class="student-photo"
        onerror="this.src='../assets/img/placeholder.jpg'"
      >
      <div class="student-info">
        <p><span class="label">Name:</span> ${student.name}</p>
        <p><span class="label">Roll No:</span> ${student.roll}</p>
        <p><span class="label">Class:</span> ${student.student_class}</p>
        <p><span class="label">Address:</span> ${student.address}</p>
        <p><span class="label">Section:</span> ${student.section || "N/A"}</p>
      </div>
      <div class="card-actions">
        <button class="btn btn-edit" onclick="openEditModal(${
          student.id
        })">Edit</button>
        <button class="btn btn-delete" onclick="handleDelete(${
          student.id
        })">Delete</button>
      </div>
    </div>
  `;
}

async function handleDelete(studentId) {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to undo this action!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });

  if (result.isConfirmed) {
    try {
      await studentService.deleteStudent(studentId);
      document.getElementById(`student-${studentId}`).remove();
      
      Swal.fire("Deleted!", "Student has been removed.", "success");
    } catch (error) {
      Swal.fire(
        "Error!",
        "Error deleting student: " + (error.response?.data?.detail || error.message),
        "error"
      );
    }
  }
}


async function openEditModal(studentId) {
  try {
    const student = await studentService.getStudent(studentId);
    
    // Fill in the edit form fields
    document.getElementById("editStudentId").value = student.id;
    
    // Get all input fields
    const inputGroups = document.querySelectorAll('#editStudentForm .input-group');
    
    // For each input field, set value and update classes properly
    const fields = [
      { id: "editStudentName", value: student.name },
      { id: "editStudentRoll", value: student.roll },
      { id: "editStudentClass", value: student.student_class },
      { id: "editStudentSection", value: student.section || "" },
      { id: "editStudentAddress", value: student.address }
    ];

    fields.forEach(field => {
      const inputGroup = document.getElementById(field.id).parentElement;
      const input = document.getElementById(field.id);
      
      input.value = field.value;
      
      if (field.value) {
        inputGroup.classList.add('is-filled');
      } else {
        inputGroup.classList.remove('is-filled');
      }
    });

    const modal = new bootstrap.Modal(document.getElementById("editStudentModal"));
    modal.show();
  } catch (error) {
    toastr.error("Error loading student details: " + error.message);
  }
}

// handle the form submission to edit a student
async function handleEditStudent(event) {
  event.preventDefault();
  const studentId = document.getElementById("editStudentId").value;
  const formData = new FormData();
  formData.append("name", document.getElementById("editStudentName").value);
  formData.append("roll", document.getElementById("editStudentRoll").value);
  formData.append(
    "student_class",
    document.getElementById("editStudentClass").value
  );
  formData.append(
    "section",
    document.getElementById("editStudentSection").value
  );
  formData.append(
    "address",
    document.getElementById("editStudentAddress").value
  );

  const photoInput = document.getElementById("editStudentPhoto");
  if (photoInput.files.length > 0) {
    formData.append("photo", photoInput.files[0]);
  }

  try {
    await studentService.updateStudent(studentId, formData);
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("editStudentModal")
    );
    if (modal) modal.hide();
    await loadStudents();
    toastr.success("Student updated successfully");
  } catch (error) {
    toastr.error(
      "Error updating student: " +
        (error.response?.data?.detail || error.message)
    );
  }
}
//handle form submission of create student
async function handleCreateStudent(event) {
  event.preventDefault();
  const formData = new FormData();
  formData.append("name", document.getElementById("studentName").value);
  formData.append("roll", document.getElementById("studentRoll").value);
  formData.append(
    "student_class",
    document.getElementById("studentClass").value
  );
  formData.append("section", document.getElementById("studentSection").value);
  formData.append("address", document.getElementById("studentAddress").value);

  const photoInput = document.getElementById("studentPhoto");
  if (photoInput.files.length > 0) {
    formData.append("photo", photoInput.files[0]);
  }

  try {
    await studentService.createStudent(formData);
    // Clear form and reload students
    document.getElementById("createStudentForm").reset();
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("createStudentModal")
    );
    if (modal) modal.hide();
    await loadStudents();
    toastr.success("Student created successfully");
  } catch (error) {
    toastr.error(
      "Error creating student: " +
        (error.response?.data?.detail || error.message)
    );
  }
}
// Existing handleCreateStudent function
async function handleCreateStudent(event) {
  event.preventDefault();
  const formData = new FormData();
  formData.append("name", document.getElementById("studentName").value);
  formData.append("roll", document.getElementById("studentRoll").value);
  formData.append(
    "student_class",
    document.getElementById("studentClass").value
  );
  formData.append("section", document.getElementById("studentSection").value);
  formData.append("address", document.getElementById("studentAddress").value);

  const photoInput = document.getElementById("studentPhoto");
  if (photoInput.files.length > 0) {
    formData.append("photo", photoInput.files[0]);
  }

  try {
    await studentService.createStudent(formData);
    // Clear form and reload students in Dashboard
    document.getElementById("createStudentForm").reset();
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("createStudentModal")
    );
    if (modal) modal.hide();
    await loadStudents();
    toastr.success("Student created successfully");

    // Notify Assignment Dashboard of new student via localStorage
    localStorage.setItem('newStudentCreated', Date.now().toString());
  } catch (error) {
    toastr.error(
      "Error creating student: " +
        (error.response?.data?.detail || error.message)
    );
  }
}


//For handeling student search
function handleSearch(searchTerm) {
  const studentCards = document.querySelectorAll('.student-card');
  const searchQuery = searchTerm.toLowerCase();
  
  studentCards.forEach(card => {
    const studentInfo = card.querySelector('.student-info');
    const name = studentInfo.querySelector('p:nth-child(1)').textContent.toLowerCase();
    const rollNumber = studentInfo.querySelector('p:nth-child(2)').textContent.toLowerCase();
    const className = studentInfo.querySelector('p:nth-child(3)').textContent.toLowerCase();
    
    // check if student details match search term
    if (name.includes(searchQuery) || 
        rollNumber.includes(searchQuery) || 
        className.includes(searchQuery)) {
      card.style.display = 'flex';  //display the card
    } else {
      card.style.display = 'none';
    }
  });
}
async function handleCreateStudent(event) {
  event.preventDefault();
  const formData = new FormData();
  const studentName = document.getElementById("studentName").value.trim();
  const studentRoll = document.getElementById("studentRoll").value.trim();
  formData.append("name", studentName);
  formData.append("roll", studentRoll);
  formData.append("student_class", document.getElementById("studentClass").value);
  formData.append("section", document.getElementById("studentSection").value);
  formData.append("address", document.getElementById("studentAddress").value);

  const photoInput = document.getElementById("studentPhoto");
  if (photoInput.files.length > 0) {
    formData.append("photo", photoInput.files[0]);
  }

  try {
    await studentService.createStudent(formData);
    document.getElementById("createStudentForm").reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById("createStudentModal"));
    if (modal) modal.hide();
    await loadStudents();
    toastr.success("Student created successfully");

    // Ensure student data is stored in localStorage
    if (!studentName || !studentRoll) throw new Error("Name or Roll is empty");
    let students = JSON.parse(localStorage.getItem("createdStudents")) || [];
    students.push({ name: studentName, roll: studentRoll });
    localStorage.setItem("createdStudents", JSON.stringify(students));
    localStorage.setItem("newStudentCreated", Date.now().toString());

    // Debug logging
    console.log("Stored student:", { name: studentName, roll: studentRoll });
    console.log("All students in localStorage:", students);
  } catch (error) {
    toastr.error("Error creating student: " + (error.response?.data?.detail || error.message));
    console.error("Creation error:", error);
  }
}