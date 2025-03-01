/**
 * Base configuration and authentication
 */
toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": false,
  "progressBar": true,
  "positionClass": "toast-top-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}

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
      const response = await axios.post(`${API_BASE_URL}/users/`, userData, {
        headers: AUTH_HEADER(),
      });
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
  createTableRow: (user) => {
    // Modified to handle groups array properly
    const getGroupName = (user) => {
      // Check if the user has groups and it's an array with items
      if (user.groups && Array.isArray(user.groups) && user.groups.length > 0) {
        return user.groups[0].name || "Unknown";
      }

      // Fallback to the old group_ids approach if present
      if (user.group_ids && user.group_ids.length > 0) {
        const groups = {
          1: "Admin",
          2: "Teacher",
          3: "Student",
        };
        return groups[user.group_ids[0]] || "Unknown";
      }

      return "Unknown";
    };

    // Convert is_active to a readable status
    const getStatus = (isActive) => {
      if (isActive === undefined || isActive === null) return "Unknown";
      return isActive ? "Active" : "Inactive";
    };

    // Determine status class for coloring
    const getStatusClass = (isActive) => {
      if (isActive === undefined || isActive === null) return "";
      return isActive ? "text-success" : "text-danger";
    };

    return `
      <tr data-user-id="${user.id}">
        <td>
          <div class="d-flex px-2 py-1">
            <div class="d-flex flex-column justify-content-center">
              <h6 class="mb-0 text-sm ">${user.username}</h6>
              <p class="text-xs text-secondary mb-0 ">ID: ${user.id}</p>
            </div>
          </div>
        </td>
        <td class="text-center"><p class="text-xs font-weight-bold mb-0">${
          user.first_name || "-"
        }</p></td>
        <td class="text-center"><p class="text-xs font-weight-bold mb-0">${
          user.last_name || "-"
        }</p></td>
        <td class="text-center"><p class="text-xs font-weight-bold mb-0">${
          user.email || "-"
        }</p></td>
        <td class="text-center"><p class="text-xs font-weight-bold mb-0">${getGroupName(
          user
        )}</p></td>
        <td class="text-center"><p class="text-xs font-weight-bold mb-0 ${getStatusClass(
          user.is_active
        )}">${getStatus(user.is_active)}</p></td>
        <td class="text-center">
          <button class="btn btn-link text-secondary mb-0 edit-user-btn">
            <i class="material-symbols-rounded text-sm me-2">edit</i>Edit
          </button>
          <button class="btn btn-link text-danger mb-0 delete-user-btn">
            <i class="material-symbols-rounded text-sm me-2">delete</i>Delete
          </button>
        </td>
      </tr>
    `;
  },

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
    // Initialize the modal property as null
    this.modal = null;
    this.setupEventListeners();
    this.loadUsers();

    // Initialize modal after DOM is fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.initializeModal()
      );
    } else {
      this.initializeModal();
    }
  }

  // Fixed modal initialization
  initializeModal() {
    const modalElement = document.getElementById("userModal");
    if (modalElement) {
      this.modal = new bootstrap.Modal(modalElement);
    } else {
      console.error("Modal element not found in the DOM");
    }
  }

  /**
   * Fetches and displays all users in the table
   */
  async loadUsers() {
    try {
      const users = await api.getUsers();
      const tableBody = dom.getElement("userTableBody");

      if (!tableBody) {
        console.error("User table body element not found");
        return;
      }

      if (users.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center">No users found</td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = users
        .map((user) => dom.createTableRow(user))
        .join("");
    } catch (error) {
      console.error("Error loading users:", error);
      dom.showError(error.message);
    }
  }

  /**
   * Sets up all event listeners for the application
   * Includes: form submission, search, modal interactions
   */
  setupEventListeners() {
    // Add new user button
    const containerRow = document.querySelector(".container-fluid .row");
    if (containerRow) {
      const addButton = `
        <div class="col-12 text-end mb-4">
          <button class="btn bg-gradient-dark mb-0" id="addUserBtn">
            <i class="material-symbols-rounded">add</i> Add New User
          </button>
        </div>
      `;
      containerRow.insertAdjacentHTML("afterbegin", addButton);

      // Add User button click handler
      const addUserBtn = dom.getElement("addUserBtn");
      if (addUserBtn) {
        addUserBtn.addEventListener("click", () => this.createUser());
      }
    }

    // Table action buttons
    const userTableBody = dom.getElement("userTableBody");
    if (userTableBody) {
      userTableBody.addEventListener("click", (e) => {
        const row = e.target.closest("tr");
        if (!row) return;

        const userId = row.dataset.userId;
        if (e.target.closest(".edit-user-btn")) {
          this.editUser(userId);
        } else if (e.target.closest(".delete-user-btn")) {
          this.deleteUser(userId);
        }
      });
    }

    // Form submission
    const userForm = dom.getElement("userForm");
    if (userForm) {
      userForm.addEventListener("submit", (e) => this.handleFormSubmit(e));
    }

    // Search functionality
    const searchInput = dom.getElement("search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => this.handleSearch(e));
    }
  }

  /**
   * Handles form submission for both creating and updating users
   * @param {Event} e - Form submission event
   */
  async handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const userIdElement = dom.getElement("userId");

    if (!userIdElement) {
      console.error("User ID element not found");
      return;
    }

    const userId = userIdElement.value;

    try {
      // Check if passwords match for new user
      if (!userId && form.password.value !== form.confirm_password.value) {
        throw new Error("Passwords do not match");
      }

      const userData = {
        username: form.username.value,
        first_name: form.firstname.value,
        last_name: form.lastname.value,
        email: form.emailaddress.value,
        // Handle group selection - modify this if backend expects a different format
        group_ids: [parseInt(form.group.value)],
      };

      if (userId) {
        // For updates, include password only if provided
        if (form.password.value || form.confirm_password.value) {
          if (form.password.value !== form.confirm_password.value) {
            throw new Error("Passwords do not match");
          }
          userData.password = form.password.value;
          userData.confirm_password = form.confirm_password.value;
        }
        // Include is_active
        const isActiveElement = dom.getElement("is_active");
        if (isActiveElement) {
          userData.is_active = isActiveElement.checked;
        }
      } else {
        // For new users, require password
        if (!form.password.value) {
          throw new Error("Password is required for new users");
        }
        userData.password = form.password.value;
        userData.confirm_password = form.confirm_password.value;
      }

      // Validate required fields
      for (const key in userData) {
        if (userData[key] === "" && key !== "is_active") {
          throw new Error(`${key.replace("_", " ")} is required`);
        }
      }

      let response;
      if (userId) {
        response = await api.updateUser(userId, userData);
      } else {
        response = await api.createUser(userData);
      }

      // Only proceed if API call was successful
      if (response) {
        if (this.modal) {
          this.modal.hide();
        } else {
          console.warn(
            "Modal instance is not available, trying to close manually"
          );
          const modalElement = document.getElementById("userModal");
          if (modalElement) {
            const bsModal = bootstrap.Modal.getInstance(modalElement);
            if (bsModal) {
              bsModal.hide();
            }
          }
        }

        await this.loadUsers();
        toastr.success(userId ? "User updated successfully" : "User added successfully");
        form.reset();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toastr.error(error.message);
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
      const username = row.querySelector("h6")?.textContent.toLowerCase() || "";
      const firstName =
        row
          .querySelectorAll("p.text-xs.font-weight-bold")[0]
          ?.textContent.toLowerCase() || "";
      const lastName =
        row
          .querySelectorAll("p.text-xs.font-weight-bold")[1]
          ?.textContent.toLowerCase() || "";
      const email =
        row
          .querySelectorAll("p.text-xs.font-weight-bold")[2]
          ?.textContent.toLowerCase() || "";

      row.style.display =
        username.includes(searchTerm) ||
        firstName.includes(searchTerm) ||
        lastName.includes(searchTerm) ||
        email.includes(searchTerm)
          ? ""
          : "none";
    });
  }

  /**
   * Prepares and shows modal for creating new user
   * Resets form and loads user dropdown
   */
  createUser() {
    const modalLabelElement = dom.getElement("userModalLabel");
    if (modalLabelElement) {
      modalLabelElement.textContent = "Add New User";
    }

    // Reset form
    const userForm = dom.getElement("userForm");
    if (userForm) {
      userForm.reset();
    }

    const userIdElement = dom.getElement("userId");
    if (userIdElement) {
      userIdElement.value = "";
    }

    // Show password fields for new user
    document.querySelectorAll(".password-field").forEach((field) => {
      field.style.display = "";
    });

    // Hide is_active for new users
    const editOnlyField = document.querySelector(".edit-only-field");
    if (editOnlyField) {
      editOnlyField.style.display = "none";
    }

    // Remove is-filled class from all input groups
    document.querySelectorAll(".input-group").forEach((group) => {
      group.classList.remove("is-filled");
    });

    // Check if modal is available
    if (this.modal) {
      this.modal.show();
    } else {
      console.error("Modal instance is not available");
      // Try to initialize it again
      this.initializeModal();
      // Check if initialization worked
      if (this.modal) {
        this.modal.show();
      } else {
        console.error("Could not initialize modal");
      }
    }
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
      const modalLabelElement = dom.getElement("userModalLabel");
      if (modalLabelElement) {
        modalLabelElement.textContent = "Edit User";
      }

      const userIdElement = dom.getElement("userId");
      if (userIdElement) {
        userIdElement.value = userId;
      }

      // Populate user fields
      const usernameElement = dom.getElement("username");
      if (usernameElement) {
        usernameElement.value = user.username;
      }

      const firstnameElement = dom.getElement("firstname");
      if (firstnameElement) {
        firstnameElement.value = user.first_name || "";
      }

      const lastnameElement = dom.getElement("lastname");
      if (lastnameElement) {
        lastnameElement.value = user.last_name || "";
      }

      const emailElement = dom.getElement("emailaddress");
      if (emailElement) {
        emailElement.value = user.email || "";
      }

      const groupElement = dom.getElement("group");
      if (groupElement && user.groups && user.groups.length > 0) {
        // Set the group dropdown to the correct group id
        groupElement.value = user.groups[0].id || "";
      } else if (groupElement && user.group_ids && user.group_ids.length > 0) {
        // Fallback to group_ids if present
        groupElement.value = user.group_ids[0] || "";
      }

      // Set is_active checkbox
      const isActiveCheckbox = dom.getElement("is_active");
      if (isActiveCheckbox) {
        isActiveCheckbox.checked = user.is_active === true;
      }

      // Show password fields for editing with empty values
      document.querySelectorAll(".password-field").forEach((field) => {
        field.style.display = ""; // Changed from 'none' to 'block'
        // Clear any previous password values
        const input = field.querySelector("input");
        if (input) {
          input.value = "";
          input.required = false; // Make passwords optional for editing
        }
      });

      // Show is_active for editing
      const editOnlyField = document.querySelector(".edit-only-field");
      if (editOnlyField) {
        editOnlyField.style.display = "block";
      }

      // Add is-filled class to all input groups with values
      document.querySelectorAll(".input-group").forEach((group) => {
        const input = group.querySelector("input, select");
        if (input && input.value) {
          group.classList.add("is-filled");
        }
      });

      // Show the modal
      if (this.modal) {
        this.modal.show();
      } else {
        console.error("Modal instance is not available for edit");
        // Try to initialize it again
        this.initializeModal();
        // Check if initialization worked
        if (this.modal) {
          this.modal.show();
        } else {
          console.error("Could not initialize modal for edit");
        }
      }
    } catch (error) {
      console.error("Error editing user:", error);
      toastr.error(error.message);
    }
  }

  /**
   * Handles user deletion with confirmation
   * @param {string} userId - ID of user being deleted
   */
  async deleteUser(userId) {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
    });
  
    if (!result.isConfirmed) return;
  
    try {
      await api.deleteUser(userId);
      await this.loadUsers();
      Swal.fire("Deleted!", "User has been deleted.", "success");
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire("Error!", error.message, "error");
    }
  }
}  

// Initialize the application
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new UserManager();
  });
} else {
  new UserManager();
}
