let _formElement = document.getElementById('register-form');
let _errorAlert = document.getElementById('error-alert');
let _successAlert = document.getElementById('success-alert');

document.getElementById("register-btn").addEventListener("click", function(event) {
    register(event);
});

function register(event) {
    event.preventDefault();

    const formData = new URLSearchParams(new FormData(_formElement));    
    _errorAlert.setAttribute("hidden", true);
    _successAlert.setAttribute("hidden", true);

    fetch("api/auth/register", { body: formData, method: "POST" })
        .then(response => response.json())
        .then(data => {
            // Show the invalid credentials alert on failure
            if(data.status === 'failure') {
                _errorAlert.innerText = data.message;
                _errorAlert.removeAttribute("hidden");
                return;
            } else {
                _successAlert.removeAttribute("hidden");
                _formElement.setAttribute("hidden", true);
            }
        });
}