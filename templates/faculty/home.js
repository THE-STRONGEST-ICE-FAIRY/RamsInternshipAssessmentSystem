fetch('/_rias/templates/landing/get_session.php')
    .then(res => res.json())
    .then(session => {
        // console.log("SESSION FETCH", session);

        greeting(session);
    })
    .catch(err => {
        console.error("get_session.php FETCH FAILED", err);
    });

function greeting(session) {
    const name = session.first_name;
    const now = new Date();
    const hour = now.getHours();

    let greeting = "Day";
    if (hour < 12) {
        greeting = "Morning";
    } else if (hour < 18) {
        greeting = "Afternoon";
    } else {
        greeting = "Evening";
    }

    document.getElementById("day").textContent = greeting;
    document.getElementById("firstName").textContent = name;

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("dateNow").textContent = now.toLocaleDateString(undefined, dateOptions);
}

fetch('home.php')
    .then(res => res.json())
    .then(data => {
        // console.log("SESSION FETCH", data);

        calendar(data);
    })
    .catch(err => {
        console.error("home.php FETCH FAILED", err);
    });

function calendar(data) {
    if (data.academic_year) {
        document.getElementById("academicYear").textContent = data.academic_year + "-" + (parseInt(data.academic_year) + 1);
        // console.log("📅 Academic Year Updated:", data.academic_year);
    } else {
        throw new Error("💢 No academic year in response.");
    }
}