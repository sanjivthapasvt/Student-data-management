class StudentService {
  constructor() {
    this.API_URL = "http://localhost:8000/api/";
  }

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

  // Helper: get one student for editing
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

  // Optional: Bind create and edit forms if you have them
  document
    .getElementById("createStudentForm")
    ?.addEventListener("submit", handleCreateStudent);
  document
    .getElementById("editStudentForm")
    ?.addEventListener("submit", handleEditStudent);
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
    // Optionally, force logout if unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "sign-in.html";
    }
  }
}

// In your script.js or wherever you create the student card
function createStudentCard(student) {
  // Get the backend URL from your config or environment
  const BACKEND_URL = 'http://localhost:8000/api'; // adjust according to your backend URL
  
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
  if (confirm("Are you sure you want to delete this student?")) {
    try {
      await studentService.deleteStudent(studentId);
      document.getElementById(`student-${studentId}`).remove();
      alert("Student deleted successfully");
    } catch (error) {
      alert(
        "Error deleting student: " +
          (error.response?.data?.detail || error.message)
      );
    }
  }
}

async function openEditModal(studentId) {
  try {
    const student = await studentService.getStudent(studentId);
    // Fill in the edit form fields (assumes you have a modal with these IDs)
    document.getElementById("editStudentId").value = student.id;
    document.getElementById("editStudentName").value = student.name;
    document.getElementById("editStudentRoll").value = student.roll;
    document.getElementById("editStudentClass").value = student.student_class;
    document.getElementById("editStudentSection").value = student.section || "";
    document.getElementById("editStudentAddress").value = student.address;

    // Show the edit modal
    const modal = new bootstrap.Modal(
      document.getElementById("editStudentModal")
    );
    modal.show();
  } catch (error) {
    alert("Error loading student details: " + error.message);
  }
}

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
    alert("Student updated successfully");
  } catch (error) {
    alert(
      "Error updating student: " +
        (error.response?.data?.detail || error.message)
    );
  }
}

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
    alert("Student created successfully");
  } catch (error) {
    alert(
      "Error creating student: " +
        (error.response?.data?.detail || error.message)
    );
  }
}
