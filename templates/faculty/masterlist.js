document.addEventListener("DOMContentLoaded", function () {
    const studentInternsBtn = document.getElementById("studentInternsBtn");
    const companiesBtn = document.getElementById("companiesBtn");

    studentInternsBtn.addEventListener("click", () => {
        changeIframe("masterlist~student.html");
    });

    companiesBtn.addEventListener("click", () => {
        changeIframe("masterlist~company.html");
    });
});
