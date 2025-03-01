document.addEventListener('DOMContentLoaded', () => {
    const attendanceBody = document.getElementById('attendanceBody');
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');
    const groupBySelect = document.getElementById('groupBySelect');
    const sortSelect = document.getElementById('sortSelect');

    // Toggle attendance status (present/absent) when clicking a status icon
    attendanceBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('status')) {
            const status = e.target;
            if (status.classList.contains('present')) {
                status.classList.remove('present');
                status.classList.add('absent');
                status.textContent = '✘';
            } else {
                status.classList.remove('absent');
                status.classList.add('present');
                status.textContent = '✔';
            }
        }
    });

    // Search employees
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = attendanceBody.getElementsByTagName('tr');
        Array.from(rows).forEach(row => {
            const employeeName = row.cells[0].textContent.toLowerCase();
            if (employeeName.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Filter by attendance status
    filterSelect.addEventListener('change', () => {
        const filter = filterSelect.value;
        const rows = attendanceBody.getElementsByTagName('tr');
        Array.from(rows).forEach(row => {
            let showRow = true;
            if (filter === 'present') {
                showRow = Array.from(row.querySelectorAll('.status.present')).length > 0;
            } else if (filter === 'absent') {
                showRow = Array.from(row.querySelectorAll('.status.absent')).length > 0;
            }
            row.style.display = showRow ? '' : 'none';
        });
    });

    // Sort by name or date (simplified example sorting by name only)
    sortSelect.addEventListener('change', () => {
        const sortBy = sortSelect.value;
        const rows = Array.from(attendanceBody.getElementsByTagName('tr'));
        if (sortBy === 'name') {
            rows.sort((a, b) => a.cells[0].textContent.localeCompare(b.cells[0].textContent));
        } else if (sortBy === 'date') {
            // This is a simplified example; you'd need to track dates for sorting
            rows.sort((a, b) => {
                const aStatus = a.querySelector('.status.present') ? 1 : -1;
                const bStatus = b.querySelector('.status.present') ? 1 : -1;
                return bStatus - aStatus; // Sort by presence (present first)
            });
        }
        rows.forEach(row => attendanceBody.appendChild(row));
    });

    // Group by (simplified example - no actual grouping, just a placeholder)
    groupBySelect.addEventListener('change', () => {
        const groupBy = groupBySelect.value;
        if (groupBy === 'name') {
            // This is a placeholder; you'd need to implement grouping logic (e.g., by department or status)
            console.log('Grouping by name not fully implemented in this example.');
        }
    });

    // Handle sidenav toggle (if needed, though Material Dashboard handles this)
    document.getElementById('iconNavbarSidenav').addEventListener('click', () => {
        document.querySelector('#sidenav-main').classList.toggle('d-none');
    });
});