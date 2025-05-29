function toggleSidebar(forceState = null) {
    const sidebar = window.parent.document.querySelector(".sidebar");
    const content = window.parent.document.querySelector(".content");
    const sidebarItems = document.querySelectorAll(".sidebar-item");

    if (!sidebar) {
        console.warn("Sidebar not found!! YOU FOOL!!");
        return;
    }

    if (forceState === "open") {
        sidebar.classList.add("open");
        sidebarItems.forEach((item) => item.classList.add("open"));
        content.classList.add("open");
    } else if (forceState === "close") {
        sidebar.classList.remove("open");
        sidebarItems.forEach((item) => item.classList.remove("open"));
        content.classList.remove("open");
    } else {
        sidebar.classList.toggle("open");
        sidebarItems.forEach((item) => item.classList.toggle("open"));
        content.classList.toggle("open");
    }
}

const ICON_DIR = "../../static/images/";

const sidebarItems = {
    admin: [
        {
            name: "HOME",
            icon: ICON_DIR + "home_icon.png",
            link: "../../templates/admin/home.php",
        },
        {
            name: "MASTERLIST",
            icon: ICON_DIR + "masterlist_icon.png",
            link: "../../templates/admin/masterlist.html",
        },
        {
            name: "DATABASE",
            icon: ICON_DIR + "database_icon.png",
            link: "../../templates/admin/database.html",
        },
        {
            name: "USERLOG",
            icon: ICON_DIR + "flag_icon.png",
            link: "../../templates/admin/userlog.html",
        },
    ],
    faculty: [
        {
            name: "HOME",
            icon: ICON_DIR + "home_icon.png",
            link: "../../templates/faculty/home.html",
        },
        {
            name: "PROGRESS",
            icon: ICON_DIR + "flag_icon.png",
            link: "../../templates/faculty/progress.html",
        },
        {
            name: "MASTERLIST",
            icon: ICON_DIR + "masterlist_icon.png",
            link: "../../templates/faculty/masterlist.html",
        },
        {
            name: "RUBRICS",
            icon: ICON_DIR + "checkbox_icon.png",
            link: "../../templates/faculty/rubrics.html",
        },
        {
            name: "REPORTS",
            icon: ICON_DIR + "report_icon.png",
            link: "../../templates/faculty/reports.html",
        },
    ],
    supervisor: [
        {
            name: "HOME",
            icon: ICON_DIR + "home_icon.png",
            link: "../../templates/supervisor/home.html",
        },
        {
            name: "MASTERLIST",
            icon: ICON_DIR + "masterlist_icon.png",
            link: "../../templates/supervisor/masterlist.html",
        },
    ],
    student: [
        {
            name: "HOME",
            icon: ICON_DIR + "home_icon.png",
            link: "../../templates/student/home.html",
        },
        {
            name: "PROFILE",
            icon: ICON_DIR + "masterlist_icon.png",
            link: "../../templates/student/profile.html",
        },
        {
            name: "EVALUATION",
            icon: ICON_DIR + "checkbox_icon.png",
            link: "../../templates/student/evaluation.html",
        },
        {
            name: "PORTFOLIO",
            icon: ICON_DIR + "report_icon.png",
            link: "../../templates/student/portfolio.html",
        },
    ],
};

function loadSidebar(role) {
    const sidebar = document.querySelector(".sidebar-content");
    sidebar.innerHTML = "";

    const currentSrc = window.parent.document.getElementById("content").src;

    const burger = document.createElement("div");
    burger.className = "sidebar-item";
    burger.setAttribute("onclick", "toggleSidebar()");
    const burgerImg = document.createElement("img");
    burgerImg.src = ICON_DIR + "burger_icon.png";
    burgerImg.alt = "Menu";
    burgerImg.className = "icon";
    burger.appendChild(burgerImg);
    sidebar.appendChild(burger);

    sidebarItems[role].forEach((item) => {
        const div = document.createElement("div");
        div.className = "sidebar-item";

        if (currentSrc.includes(item.link)) {
            div.classList.add("active");
        }

        // const linkWithToken =
        //     item.link +
        //     (item.link.includes("?") ? "&" : "?") +
        //     "token=" +
        //     encodeURIComponent(authToken);
        div.setAttribute("onclick", `changeIframe('${item.link}')`);

        const span = document.createElement("span");
        span.textContent = item.name;

        const img = document.createElement("img");
        img.src = item.icon;
        img.alt = "Icon";
        img.className = "icon";

        div.appendChild(span);
        div.appendChild(img);
        sidebar.appendChild(div);
    });

    const firstItem = sidebar.querySelectorAll(".sidebar-item")[1];
    if (firstItem) firstItem.classList.add("active");
}

window.addEventListener("message", (event) => {
    if (event.data.role) {
        loadSidebar(event.data.role);
    }
});

const sidebar = document.getElementById("sidebar-content");

let timeout;

if (sidebar) {
    sidebar.addEventListener("mouseleave", () => {
        timeout = setTimeout(() => {
            toggleSidebar("close");
        }, 100);
    });

    sidebar.addEventListener("mouseenter", () => {
        clearTimeout(timeout);
    });
}

function changeIframe(
    newSrc,
    text = "Are you sure you want to leave this page?\nUnsaved changes may be lost!",
    force = true
) {
    const pagesThatNeedConfirmation = ["evaluation1.html"];

    const contentFrame = window.parent.document.getElementById("content");
    const currentSrc = contentFrame?.src || "";

    const url = new URL(contentFrame.src);
    const params = new URLSearchParams(url.search);

    force = !(
        params.get("data-status") == "evaluate" ||
        params.get("data-status") == "continue"
    );

    const isLeavingImportantPage = (page) => currentSrc.includes(page);
    const isEnteringImportantPage = pagesThatNeedConfirmation.some((page) =>
        newSrc.includes(page)
    );

    if (!force) {
        const confirmed = confirm(text);

        if (!confirmed) {
            return;
        }
    }

    contentFrame.src = newSrc;

    document.querySelectorAll(".sidebar-item").forEach((el) => {
        el.classList.remove("active");
    });

    const sidebarIframe = window.parent.document.getElementById("sidebarFrame");

    if (sidebarIframe) {
        const sidebarDoc = sidebarIframe.contentWindow.document;

        sidebarDoc.querySelectorAll(".sidebar-item").forEach((el) => {
            el.classList.remove("active");
        });

        const matchingItem = Array.from(
            sidebarDoc.querySelectorAll(".sidebar-item")
        ).find((item) => item.getAttribute("onclick")?.includes(newSrc));

        if (matchingItem) {
            matchingItem.classList.add("active");
        }
    }
}
