function renderResults(students) {
    const tbody = document.getElementById("resultsTable");
    console.log("Rendering students:", students); // Debug log
    tbody.innerHTML = students.length === 0 
        ? '<tr><td colspan="3" class="p-4 text-center text-gray-500">No students created yet</td></tr>'
        : students.map(student => {
            console.log("Rendering student:", student); // Log each student
            return `
                <tr class="hover:bg-gray-50">
                    <td class="p-4">${student.name || "Unknown"}</td>
                    <td class="p-4">${student.roll || "N/A"}</td>
                    <td class="p-4">
                        <button onclick="printAdmitCard('${student.name || 'Unknown'}', '${student.roll || 'N/A'}')" 
                                class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                            Print Admit Card
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
}

function printAdmitCard(name, roll) {
    const modal = document.getElementById("admitCardModal");
    const content = document.getElementById("admitCardContent");
    console.log("Printing admit card for:", { name, roll }); // Debug log
    content.innerHTML = `
        <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Admit Card</h2>
            <div class="border p-4 rounded-lg bg-gray-50">
                <p class="text-lg"><span class="font-semibold">Name:</span> ${name}</p>
                <p class="text-lg"><span class="font-semibold">Roll:</span> ${roll}</p>
                <p class="text-sm text-gray-500 mt-4">Exam Date: March 15, 2025</p>
            </div>
            <button onclick="window.print()" 
                    class="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition">
                Print
            </button>
            <button onclick="document.getElementById('admitCardModal').classList.add('hidden')" 
                    class="mt-2 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition">
                Close
            </button>
        </div>
    `;
    modal.classList.remove("hidden");
}

// Load and update results based on localStorage
document.addEventListener("DOMContentLoaded", () => {
    // Initial load from localStorage
    let students = JSON.parse(localStorage.getItem("createdStudents")) || [];
    renderResults(students);

    // Search input handling
    document.getElementById("searchInput").addEventListener("input", (e) => {
        const query = e.target.value.trim().toLowerCase();
        let students = JSON.parse(localStorage.getItem("createdStudents")) || [];
        const filteredStudents = students.filter(student => 
            (student.name || "").toLowerCase().includes(query) || 
            (student.roll || "").toString().includes(query)
        );
        renderResults(filteredStudents);
    });

    // Listen for new student creation across tabs
    window.addEventListener("storage", (e) => {
        if (e.key === "newStudentCreated") {
            students = JSON.parse(localStorage.getItem("createdStudents")) || [];
            renderResults(students);
        }
    });

    // Fallback: Check localStorage changes in the same tab
    let lastKnownUpdate = localStorage.getItem("newStudentCreated");
    setInterval(() => {
        const currentUpdate = localStorage.getItem("newStudentCreated");
        if (currentUpdate && currentUpdate !== lastKnownUpdate) {
            lastKnownUpdate = currentUpdate;
            students = JSON.parse(localStorage.getItem("createdStudents")) || [];
            renderResults(students);
        }
    }, 500); // Check every 500ms
});