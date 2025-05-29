window.addEventListener("message", (event) => {
    // console.log(event.data);
    if (event.data.role) {
        document.getElementById("roleText").textContent = event.data.role;
    }
});

function logout() {
    const confirmation = confirm("Are you sure you want to log out?");

    // If the user confirms, proceed with the logout
    if (confirmation) {
        // Redirect to the PHP logout page
        top.location.href = "logout.php";
    }
}