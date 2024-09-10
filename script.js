// Logowanie - login: vlmo, hasło: 12345
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    
    if (username === "vlmo" && password === "12345") {
        // Przekierowanie do głównej strony po zalogowaniu
        window.location.href = "main.html";
    } else {
        document.getElementById("errorMessage").style.display = "block";
    }
});
