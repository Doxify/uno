let _formElement = document.getElementById('login-form');
let _errorAlert = document.getElementById('error-alert');

document.getElementById("login-btn").addEventListener("click", function(event) {
    login(event);
});

function login(event) {
    event.preventDefault();

    const formData = new URLSearchParams(new FormData(_formElement));    
    _errorAlert.setAttribute("hidden", true);

    fetch("api/auth/login", { body: formData, method: "POST" })
        .then(response => {
            // Show the invalid credentials alert on HTTP 401
            if(response.status === 401) {
                _errorAlert.removeAttribute("hidden");
                return;
            }

            // Redirect to index on success.
            window.location.href = "/";
        });
}