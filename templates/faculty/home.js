fetch('/_rias/templates/landing/get_session.php')
    .then(res => res.json())
    .then(session => {
        console.log("🍪 SESSION FEAST 🍪", session);
        const id = session.user_id;
        const name = session.name;
        const role = session.role;
        // ☠️ YOU HAVE UNLIMITED POWER
    });
