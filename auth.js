// ===============================
// CONFIG LOGIN
// ===============================
const VALID_USERNAME = "admin";
const VALID_PASSWORD = "12345";
const VALID_EXPIRED = "2030-01-01"; // bebas

// ===============================
// LOGIN LOGIC
// ===============================
function handleLogin(event) {
    event.preventDefault();

    const username = document.querySelector("input[name='username']").value.trim();
    const password = document.querySelector("input[name='key']").value.trim();
    const now = Date.now();
    const expired = new Date(VALID_EXPIRED).getTime();

    if (username !== VALID_USERNAME) return showToast("Username salah!");
    if (password !== VALID_PASSWORD) return showToast("Password salah!");
    if (now > expired) return showToast("Akses sudah expired!");

    // Login sukses → redirect
    window.location.href = "index.html";
}

// ===============================
// TOAST
// ===============================
function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}
