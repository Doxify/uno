
document.getElementById("logout-btn").addEventListener("click", function(event) {
    logout(event);
});

function logout(event) {
    event.preventDefault();

    fetch("api/auth/logout", { method: "GET" })
        .then(() => { window.location.href = "/"; });
}