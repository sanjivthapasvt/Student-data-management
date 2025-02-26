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

/**
 * API Integration Methods
 * Handles all CRUD operations with the backend
 */
const api = {
  // Fetches user data for all users or a specific user
  async getUser(userId = "") {
    try {
      const url = `${API_BASE_URL}/users/${userId}`.replace(/\/$/, "");
      const response = await axios.get(url, { headers: AUTH_HEADER() });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, "Error loading users"));
    }
  },

  // Creates a new user
  async createUser(userData) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/`,
        userData,
        { headers: AUTH_HEADER() }
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage || "Error creating user");
    }
  },

  // Updates existing user data
  async updateUser(userId, userData) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${userId}/`,
        userData,
        { headers: AUTH_HEADER() }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, "Error updating user"));
    }
  },

  // Deletes a user
  async deleteUser(userId) {
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}/`, {
        headers: AUTH_HEADER(),
      });
    } catch (error) {
      throw new Error(handleApiError(error, "Error deleting user"));
    }
  },

  // Fetches list of all users
  async getUsers() {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/`, {
        headers: AUTH_HEADER(),
      });
      return response.data; // e.g., [{ id: 1, username: "Alice", email: "alice@example.com" }, ...]
    } catch (error) {
      throw new Error(handleApiError(error, "Error fetching users"));
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
  createTableRow: (user) => `
        <tr data-user-id="${user.id}">
            <td>
                <div class="d-flex px-2 py-1">
                    <div class="d-flex flex-column justify-content-center">
                        <h6 class="mb-0 text-sm ">${user.username}</h6>
                        <p class="text-xs text-secondary mb-0 ">Email: ${user.email}</p>
                    </div>
                </div>
            </td>
            <td><p class="text-xs font-weight-bold mb-0">${user.first_name}</p></td>
            <td><p class="text-xs font-weight-bold mb-0">${user.last_name}</p></td>
            <td><p class="text-xs font-weight-bold mb-0">${user.email}</p></td>
            <td><p class="text-xs font-weight-bold mb-0">${user.group}</p></td>
            <td><p class="text-xs font-weight-bold mb-0">${user.status}</p></td>
            <td class="align-middle">
                <button class="btn btn-link text-secondary mb-0 edit-user-btn">
                    <i class="material-symbols-rounded text-sm me-2">edit</i>Edit
                </button>
                <button class="btn btn-link text-danger mb-0 delete-user-btn">
                    <i class="material-symbols-rounded text-sm me-2">delete</i>Delete
                </button>
            </td>
        </tr>
    `,

  // Displays error messages in the table
  showError: (message) => {
    const tableBody = dom.getElement("userTableBody");
    tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">${message}</td>
            </tr>
        `;
  },
};

/**
 * Main Application Class
 * Manages all user management operations and UI interactions
 */
class UserManager {
  constructor() {
    this.modal = null;
    this.setupEventListeners();
    this.loadUsers();
  }

  /**
   * Fetches and displays all users in the table
   */
  async loadUsers() {
    try {
      const users = await api.getUsers();
      const tableBody = dom.getElement("userTableBody");
      tableBody.innerHTML = users
        .map((user) => dom.createTableRow(user))
        .join("");
    } catch (error) {
      dom.showError(error.message);
    }
  }

  /**
   * Populates user dropdown with all available users
   */
  async loadUsersDropdown() {
    try {
      const users = await api.getUsers();
      const userSelect = dom.getElement("userSelect");
      // Clear existing options
      userSelect.innerHTML = "";
      // Add a default placeholder
      userSelect.innerHTML =
        '<option value="">-- Select a User --</option>';

      // Populate with user options
      users.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = `${user.username} (${user.email})`;
        userSelect.appendChild(option);
      });
    } catch (error) {
      alert(error.message);
    }
  }

  /**
   * Sets up all event listeners for the application
   * Includes: form submission, search, modal interactions
   */
  setupEventListeners() {
    // Add new user button
    const addButton = `
            <div class="col-12 text-end mb-4">
                <button class="btn bg-gradient-dark mb-0" id="addUserBtn">
                    <i class="material-symbols-rounded">add</i> Add New User
                </button>
            </div>
        `;
    document
      .querySelector(".container-fluid .row")
      .insertAdjacentHTML("afterbegin", addButton);

    // Event listeners
    document.addEventListener("DOMContentLoaded", () => {
      this.modal = new bootstrap.Modal(dom.getElement("userModal"));
      dom
        .getElement("addUserBtn")
        .addEventListener("click", () => this.createUser());
    });

    dom.getElement("userTableBody").addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      if (!row) return;

      const userId = row.dataset.userId;
      if (e.target.closest(".edit-user-btn")) {
        this.editUser(userId);
      } else if (e.target.closest(".delete-user-btn")) {
        this.deleteUser(userId);
      }
    });

    dom
      .getElement("userForm")
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
   * Handles form submission for both creating and updating users
   * @param {Event} e - Form submission event
   */
  async handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const userId = dom.getElement("userId").value;
    const selectedUserId = dom.getElement("userSelect").value;
  
    const userData = {
      user_id: userId || selectedUserId, // Add this line
      username: form.username.value,
      first_name: form.firstname.value,
      last_name: form.lastname.value,
      email: form.emailaddress.value,
      group: form.group.value,
      status: form.status.value
    };
  
    try {
      if (userId) {
        await api.updateUser(userId, userData);
      } else {
        if (!selectedUserId) {
          throw new Error("Please select a user");
        }
        await api.createUser(userData);
      }
  
      this.modal.hide();
      await this.loadUsers();
      alert(userId ? "User updated successfully" : "User added successfully");
    } catch (error) {
      alert(error.message);
    }
  }

  /**
   * Implements search functionality across user names and emails
   * @param {Event} e - Input event from search field
   */
  handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll("#userTableBody tr");

    rows.forEach((row) => {
      const username =
        row.querySelector("h6")?.textContent.toLowerCase() || "";
      const email =
        row.querySelector("p")?.textContent.toLowerCase() || "";

      row.style.display =
        username.includes(searchTerm) || email.includes(searchTerm)
          ? ""
          : "none";
    });
  }

  /**
   * Prepares and shows modal for creating new user
   * Resets form and loads user dropdown
   */
  createUser() {
    dom.getElement("userModalLabel").textContent = "Add New User";

    // Reset form
    dom.getElement("userForm").reset();
    dom.getElement("userId").value = "";

    // Show dropdown, hide read-only info
    dom.getElement("userSelectGroup").style.display = "";
    dom.getElement("userInfoGroup").style.display = "none";

    // Remove is-filled class from all input groups
    document.querySelectorAll('.input-group').forEach(group => {
        group.classList.remove('is-filled');
    });

    // Load the dropdown with all users
    this.loadUsersDropdown();

    this.modal.show();
  }

  /**
   * Loads and displays existing user data for editing
   * @param {string} userId - ID of user being edited
   */
  async editUser(userId) {
    try {
        const userData = await api.getUser(userId);
        const user = Array.isArray(userData) ? userData[0] : userData;

        // Set modal title and user ID
        dom.getElement('userModalLabel').textContent = 'Edit User';
        dom.getElement('userId').value = userId;

        // Set user info in read-only field
        dom.getElement('userInfo').value = `${user.username} (Email: ${user.email})`;
        
        // Populate user fields
        dom.getElement('username').value = user.username;
        dom.getElement('firstname').value = user.first_name;
        dom.getElement('lastname').value = user.last_name;
        dom.getElement('emailaddress').value = user.email;
        dom.getElement('group').value = user.group;
        dom.getElement('status').value = user.status;

        // Add is-filled class to all input groups with values
        document.querySelectorAll('.input-group').forEach(group => {
            const input = group.querySelector('input');
            if (input && input.value) {
                group.classList.add('is-filled');
            }
        });

        // Hide dropdown, show read-only info
        dom.getElement('userSelectGroup').style.display = 'none';
        dom.getElement('userInfoGroup').style.display = '';
        dom.getElement('userInfoGroup').classList.add('is-filled');

        this.modal.show();
    } catch (error) {
        alert(error.message);
    }
  }
  
  /**
   * Handles user deletion with confirmation
   * @param {string} userId - ID of user being deleted
   */
  async deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await api.deleteUser(userId);
        await this.loadUsers();
        alert("User deleted successfully");
      } catch (error) {
        alert(error.message);
      }
    }
  }
}

// Initialize the application
new UserManager();
