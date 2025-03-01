function showNotification(message, type = "success") {
    const toastElement = document.getElementById("notificationToast");
    const toastBody = document.getElementById("toastMessage");
  
    toastElement.classList.remove("bg-success", "bg-danger", "bg-warning");
    toastElement.classList.add(`bg-${type}`);
    
    toastBody.textContent = message;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }
  