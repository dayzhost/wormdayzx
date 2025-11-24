
// Ganti username & password di sini
const AUTH_DATA = {
  username: "dayzx",
  password: "ganteng"
};

function isAuthenticated() {
  return localStorage.getItem("authenticated") === "true";
}

function authenticate(username, password) {
  if (
    username === AUTH_DATA.username &&
    password === AUTH_DATA.password
  ) {
    localStorage.setItem("authenticated", "true");
    return true;
  }
  return false;
}

function logout() {
  localStorage.removeItem("authenticated");
}

function protectPage() {
  if (!isAuthenticated() && !window.location.pathname.includes("login.html")) {
    window.location.href = "login.html";
  }
}
protectPage();
