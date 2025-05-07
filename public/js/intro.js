function loadScript(src, callback) {
  const script = document.createElement("script");
  script.src = src;
  script.onload = callback;
  document.head.appendChild(script);
}

loadScript("./js/main.js", () => {
  window.showSignInForm = function () {
    getElement(".buttons-register-wraper").style.display = "none";
    getElement("#signInForm").style.display = "flex";
  };

  window.showLoginInForm = function () {
    getElement(".buttons-register-wraper").style.display = "none";
    getElement("#authForm-wraper").style.display = "flex";
  };

  window.returnToMain = function () {
    getElement(".buttons-register-wraper").style.display = "flex";
    getElement("#signInForm").style.display = "none";
    getElement("#authForm-wraper").style.display = "none";
  };

  window.signInForm = function (elem) {
    let form = elem.form;
    console.dir(form.querySelector("#select-group-signIn"));
    let groupSelect = form.querySelector("#select-group-signIn");
    let blockGroup = groupSelect
      .closest(".form-item")
      .querySelector(".block-error");

    let genderSelect = form.querySelector("#select-gender-signIn");
    let blockGender = genderSelect
      .closest(".form-item")
      .querySelector(".block-error");

    if (groupSelect.value == "selected") {
      blockGroup.style.display = "block";
      return false;
    } else {
      blockGroup.style.display = "none";
    }

    if (genderSelect.value == "selected") {
      blockGender.style.display = "block";
      return false;
    } else {
      blockGender.style.display = "none";
    }

    if (
      checkEmail(getElement("#input-email-signIn")) &&
      checkBirthday(getElement("#input-date-signIn")) &&
      checkName(getElement("#fname_signIn")) &&
      checkSurname(getElement("#lname_signIn")) != "" &&
      groupSelect.value != "selected" &&
      genderSelect.value != "selected" &&
      checkPassword(getElement("#password_signIn")) &&
      checkRepeatPassword(getElement("#passwordRepeat_signIn"))
    ) {
      registerUser();
    }
  };

  function registerUser() {
    // Перевірка елементів перед відправкою
    console.log("Checking input values:");
    const fname = getElement("#fname_signIn").value;
    const email = getElement("#input-email-signIn").value;
    const lname = getElement("#lname_signIn").value;
    const birthday = getElement("#input-date-signIn").value;
    const group = getElement("#select-group-signIn").value;
    const gender = getElement("#select-gender-signIn").value;
    const password = getElement("#password_signIn").value;

    console.log("First name:", fname);
    console.log("Email:", email);
    console.log("Last name:", lname);
    console.log("Birthday:", birthday);
    console.log("Group:", group);
    console.log("Gender:", gender);
    console.log("Password:", password);

    // Дебаг: якщо хоча б одне поле порожнє, вивести повідомлення про помилку
    if (
      !fname ||
      !email ||
      !lname ||
      !birthday ||
      !group ||
      !gender ||
      !password
    ) {
      alert("Будь ласка, заповніть всі поля!");
      return; // не відправляти запит, якщо є порожні поля
    }

    const formData = new FormData();
    formData.append("name", fname);
    formData.append("email", email);
    formData.append("surname", lname);
    formData.append("birthday", birthday);
    formData.append("group", group);
    formData.append("gender", gender);
    formData.append("password", password);
    const role = document.querySelector('input[name="role"]:checked').value;
    formData.append("role", role);

    console.log("Form Data being sent:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    // Відправка fetch
    fetch("/Project/public/api/register.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Response from server:", data);
        if (data.message) {
          alert(data.message);
        } else if (data.errors) {
          alert(data.errors.join("\n")); // Вивести всі помилки списком
        } else {
          alert("Сталася невідома помилка.");
        }

        if (data.success) {
          const user = data.user;
          const newUser = new User(
            user.id,
            user.group,
            user.name,
            user.surname,
            user.gender,
            user.birthday,
            user.is_logged_in,
            user.role,
            user.password,
            user.email
          );

          localStorage.removeItem("currentUser");
          localStorage.setItem("currentUser", JSON.stringify(newUser));
          window.location.href = "http://localhost/Project/public/table.php";
        }
      })
      .catch((err) => {
        console.error("Error occurred during fetch:", err);
        alert("Сталася помилка при відправці запиту!");
      });
  }

  window.loginIn = function () {
    const email = getElement("#input-email-loginIn").value;
    const password = getElement("#password").value;

    fetch("/Project/public/api/login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(
        password
      )}`,
    })
      .then((response) => response.json())
      .then((data) => {
        const user = data.user;

        if (data.success) {
          const newUser = new User(
            user.id,
            user.group,
            user.name,
            user.surname,
            user.gender,
            user.birthday,
            user.is_logged_in,
            user.role,
            user.password,
            user.email
          );

          localStorage.removeItem("currentUser");
          localStorage.setItem("currentUser", JSON.stringify(newUser));
          window.location.href = "http://localhost/Project/public/table.php";
        } else {
          if (data.message) {
            alert(data.message);
          } else if (data.errors) {
            alert(data.errors.join("\n")); // Вивести всі помилки списком
          } else {
            alert("Сталася невідома помилка.");
          }

          console.error("Помилка логіну або користувач не знайдений:", data);
        }
      })
      .catch((err) => console.error("Помилка:", err));
  };

  window.checkPassword = function (elem) {
    console.log(elem);
    let password = elem.value;
    const pattern = /^[A-Za-z0-9_]{8,}$/;
    let block = elem.nextElementSibling;
    if (password.length < 8) {
      block.style.display = "block";
      block.textContent = "Password must have at least 8 symbols";
      return false;
    } else if (!pattern.test(password)) {
      console.log(block);
      block.style.display = "block";
      block.textContent =
        "The password can only contain English letters, numbers and _.";
      return false;
    } else {
      block.style.display = "none";
      return true;
    }
  };

  window.checkRepeatPassword = function (elem) {
    let repeatPassword = elem.value;
    console.log(repeatPassword);

    let block = elem.nextElementSibling;
    const password = getElement("#password_signIn").value;
    if (password != repeatPassword) {
      block.style.display = "block";
      block.textContent = "Password is not the same";
      return false;
    } else {
      block.style.display = "none";
      return true;
    }
  };
});



function roleChanged(radio) {
  if(radio.value == "teacher") {
    getElement("#select-group-signIn").style.display = "none";
    getElement(`label[for="select-group-signIn"]`).style.display = "none";
    getElement(`#select-group-signIn`).value = "PZ-21";
  } else{
    getElement("#select-group-signIn").style.display = "block";
    getElement(`label[for="select-group-signIn"]`).style.display = "block";
  }
}