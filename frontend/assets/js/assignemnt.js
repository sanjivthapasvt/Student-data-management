document.addEventListener("DOMContentLoaded", function () {
    const assignments = [
        { lastName: "Shishir", firstName: "Thapa", dsa: false, statistics: true, java: true, sad: true, webTech: true, turnedIn: true },
        { lastName: "Sanjiv ", firstName: "Thapa", dsa: false, statistics: false, java: true, sad: true, webTech: true, turnedIn: true },
        { lastName: "Boa ", firstName: "Hancock", dsa: false, statistics: false, java: false, sad: true, webTech: true, turnedIn: true },
        { lastName: "Nirjal", firstName: "Ansari", dsa: true, statistics: true, java: true, sad: true, webTech: true, turnedIn: true },
        { lastName: "Mohomaad", firstName: "Ansari", dsa: false, statistics: false, java: false, sad: false, webTech: false, turnedIn: false }
    ];

    const tbody = document.getElementById("assignment-data");
    const progressText = document.getElementById("progress-text");
    const progressBar = document.querySelector(".progress");
    const selectAllCheckbox = document.getElementById("select-all");

    function updateProgress() {
        const turnedInCount = assignments.filter(a => a.turnedIn).length;
        const totalCount = assignments.length;
        const percentage = (turnedInCount / totalCount) * 100;
        
        progressText.textContent = `${turnedInCount}/${totalCount} students have turned in assignment`;
        progressBar.style.width = `${percentage}%`;
    }

    function renderAssignments() {
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
        const student = assignments[studentIndex];
        return student.dsa && student.statistics && student.java && student.sad && student.webTech;
    }

    function updateStudentTurnedIn(studentIndex) {
        assignments[studentIndex].turnedIn = isAllSubjectsChecked(studentIndex);
        renderAssignments();
        updateProgress();
    }

    function attachEventListeners() {
        document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
            checkbox.addEventListener("change", function () {
                if (this.className === "total-checkbox") return; // Ignore Total checkbox changes

                const studentIndex = this.getAttribute("data-student") || this.getAttribute("data-index");
                const subject = this.getAttribute("data-subject");

                if (subject) {
                    // Update subject-specific checkbox
                    assignments[studentIndex][subject] = this.checked;
                } else if (this.id !== "select-all") {
                    // Update student-level checkbox
                    assignments[studentIndex].turnedIn = this.checked;
                }

                updateStudentTurnedIn(studentIndex);
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

    renderAssignments();
    updateProgress();
});