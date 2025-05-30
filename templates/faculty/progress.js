document.addEventListener("DOMContentLoaded", () => {
    fetch('progress.php')
        .then(res => res.json())
        .then(data => {
            const statsMap = {
                totalInterns: "totalInterns",
                intern1: "intern1",
                intern2: "intern2",
                deployedStudents: "deployedStudents",
                nonDeployedStudents: "nonDeployedStudents"
            };

            for (let key in statsMap) {
                const el = document.getElementById(statsMap[key]);
                if (el) el.textContent = data[key] ?? 0;
                else console.warn("⚠️ Element not found for:", key);
            }
        })
        .catch(err => {
            console.error("🧨 DASHBOARD FETCH FAILED:", err);
        });
});