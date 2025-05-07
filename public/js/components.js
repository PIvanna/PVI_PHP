function includeHTML(file, elementId, callback) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById(elementId).innerHTML = data;
      if (callback) callback(); // викликає callback після вставки HTML
    })
    .catch((error) => console.error(`Error loading ${file}:`, error));
}
document.addEventListener("DOMContentLoaded", () => {
  includeHTML("components/header.php", "header-placeholder", () => {
    const script = document.createElement("script");
    script.src = "/Project/public/js/header.js";
    document.body.appendChild(script);
  });

  includeHTML("components/sidebar.php", "sidebar-placeholder");

  let currentPath = window.location.pathname.split("/").pop();
  const observer = new MutationObserver(() => {
    const navItems = document.querySelectorAll(".nav-item");

    if (navItems.length > 0) {
      navItems.forEach((link, index) => {
        const href = link.getAttribute("href");

        // Перевіряємо, чи поточний шлях є шляхом до поточної сторінки
        if (href === "./" + currentPath) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }

        // Додатково перевіряємо, чи в шляху є "index.php", і якщо так, робимо активним третій лінк
        if (currentPath.includes("index.php") && index === 2) {
          link.classList.add('active');
        }
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
