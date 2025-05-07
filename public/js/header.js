function loadScript(src, callback) {
  const script = document.createElement("script");
  script.src = src;
  script.onload = callback;
  document.head.appendChild(script);
}

currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (currentUser) {
  console.log("Поточний користувач:", currentUser);
  getElement("#userInit").textContent =
    currentUser.name + " " + currentUser.surname;
} else {
  console.log("Поточний користувач не знайдений");
}

function logoutFrom() {
  localStorage.removeItem("currentUser");
  window.location.href = "/Project/public/api/logout.php";
}
