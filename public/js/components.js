function includeHTML(file, elementId, callback) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => {
      const targetElement = document.getElementById(elementId);
      if (targetElement) {
        targetElement.innerHTML = data;
        if (callback) callback();
      } else {
        console.error(`Element with ID '${elementId}' not found for includeHTML.`);
      }
    })
    .catch((error) => console.error(`Error loading ${file}:`, error));
}
document.addEventListener("DOMContentLoaded", () => {
    console.log("COMPONENTS.JS: DOMContentLoaded triggered.");

  includeHTML("components/header.php", "header-placeholder", () => {
    const script = document.createElement("script");
    script.src = "/Project/public/js/header.js";
    script.onload = function() {
      // Цей код виконається ПІСЛЯ того, як header.js буде завантажений та виконаний.
      // Якщо в header.js є функції, які потрібно викликати для ініціалізації,
      // їх можна викликати тут, АБО краще, щоб header.js сам себе ініціалізував.
      console.log("COMPONENTS.JS: header.js has been loaded and executed.");
      // Якщо header.js експортує функцію ініціалізації, наприклад, window.initializeHeaderLogic()
      // if (typeof window.initializeHeaderLogic === 'function') {
      //   window.initializeHeaderLogic();
      // }
    };
    script.onerror = function() {
        console.error("COMPONENTS.JS: Failed to load header.js!");
    };
    document.body.appendChild(script);
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
