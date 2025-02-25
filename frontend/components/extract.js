document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file || !file.name.endsWith('.xlsx')) {
        alert("Please upload a valid .xlsx file.");
        return;
    }

    const formData = new FormData();
    formData.append('excelFile', file);

    try {
        const response = await axios.post('http://localhost:8000/api/process-excel/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        console.log("Response from server:", response.data);

        if (response.data.columns && response.data.rows) {
            let outputHtml = '';

            response.data.rows.forEach(row => {
                outputHtml += `
                    <div class="id-card">
                        <img src="https://via.placeholder.com/80" alt="Profile">
                        <h3>${row["Full Name"] || 'Unknown'}</h3>
                        <p><strong>Roll:</strong> ${row["Roll No"] || 'N/A'}</p>
                        <p><strong>Class:</strong> ${row["Class"] || 'N/A'}</p>
                        <p><strong>Address:</strong> ${row["Address"] || 'N/A'}</p>
                    </div>
                `;
            });

            document.getElementById('results').innerHTML = outputHtml;
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to process file. Check console for details.");
    }
});
