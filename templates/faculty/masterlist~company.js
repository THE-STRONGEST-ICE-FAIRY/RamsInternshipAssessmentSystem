document.addEventListener("DOMContentLoaded", function () {
    setup();
    fetchCompanies();
});

function setup() {
    const backBtn = document.getElementById("back");

    backBtn.addEventListener("click", () => {
        changeIframe("masterlist.html");
    });
}

function fetchCompanies() {
    fetch('../../templates/faculty/masterlist~company.php')
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('companyList');
            tbody.innerHTML = '';

            if (data.error) {
                console.error('💥 ERROR:', data.error);
                return;
            }

            data.forEach((company, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${company.company_email}</td>
                    <td>${company.company_name}</td>
                    <td>${company.company_website}</td>
                    <td>${company.company_address}</td>
                    <td>${company.department_count}</td>
                    <td>${company.supervisor_count}</td>
                    <td>${company.intern_allowance ?? 'N/A'}</td>
                    <td>${company.partnership_status == 1 ? 'Yes' : 'No'}</td>
                    <td>${company.revenue_growth ?? '—'}</td>
                    <td>${company.profit_margins ?? '—'}</td>
                    <td>${company.roi ?? '—'}</td>
                    <td>${company.roa ?? '—'}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(err => console.error('💥 FETCH FAIL:', err));
}