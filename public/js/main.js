const getElement = document.querySelector.bind(document);

let addIS = false;
let editIs = false;
const select_group = getElement("#select-group");
const f_name = getElement("#fname");
const l_name = getElement("#lname");
const select_gender = getElement("#select-gender");
const input_date = getElement("#input-date");
const selectTeachers = getElement("#select-teachers");
const selectStudents = getElement("#select-students");
let clickedElemToDel = null;
let all = false;

let tableStudents = [];
let tableTeachers = [];
let studentsForEdit = [];
let teachersForEdit = [];

let currentPage = 1;
const itemsPerPage = 5;

class User {
  constructor(
    id,
    group,
    name,
    surname,
    gender,
    birthday,
    is_logged_in,
    role,
    password,
    email
  ) {
    this.id = id;
    this.group = group;
    this.name = name;
    this.gender = gender;
    this.birthday = birthday;
    this.is_logged_in = is_logged_in;
    this.surname = surname;
    this.password = password;
    this.role = role;
    this.email = email;
  }
}

class Student {
  static count = loadStudentsFromLocalStorage().length + 1;

  constructor(group, name, gender, birthday, status) {
    this.id = Student.count++;
    this.group = group;
    this.name = name;
    this.gender = gender;
    this.birthday = birthday;
    this.status = status;
  }
}

let student = null;
let students;
let currentUser;
let currentTable;
document.addEventListener("DOMContentLoaded", function () {
  if (
    window.location.pathname.split("/").pop() == "index.php" ||
    window.location.pathname.split("/").pop() == ""
  ) {
    students = loadStudentsFromLocalStorage();

    currentUser = JSON.parse(localStorage.getItem("currentUser"));
    currentTable = JSON.parse(localStorage.getItem("currentTable"));
    if (currentTable) {
      console.log("Поточна таблиця:", currentTable);

      tableStudents = [];
      tableTeachers = [];

      // Створюємо об'єкти User для студентів
      currentTable.students.forEach((student) => {
        const studentObj = new User(
          student.id,
          student.group,
          student.name,
          student.surname,
          student.gender,
          student.birthday,
          student.is_logged_in,
          student.role,
          student.password,
          student.email
        );
        tableStudents.push(studentObj);
      });

      // Створюємо об'єкти User для викладачів
      currentTable.teachers.forEach((teacher) => {
        const teacherObj = new User(
          teacher.id,
          teacher.group,
          teacher.name,
          teacher.surname,
          teacher.gender,
          teacher.birthday,
          teacher.is_logged_in,
          teacher.role,
          teacher.password,
          teacher.email
        );
        tableTeachers.push(teacherObj);
      });

      console.log("Студенти цієї таблиці:", tableStudents);
      console.log("Викладачі цієї таблиці:", tableTeachers);
      // Об'єднуємо tableStudents і tableTeachers в масив students
      students = [...tableTeachers, ...tableStudents];

      getElement("#main-name-table").textContent = currentTable.name;
    }
    if (currentUser) {
      console.log("Поточний користувач:", currentUser);
    } else {
      console.log("Поточний користувач не знайдений");
    }

    loadPage();
  }
});

function saveStudentsToLocalStorage() {
  localStorage.setItem("students", JSON.stringify(students));
}

function loadStudentsFromLocalStorage() {
  const storedStudents = localStorage.getItem("students");
  return storedStudents ? JSON.parse(storedStudents) : [];
}

function loadPage() {
  renderPage();
  setupPagination();
}

function renderPage() {
  const main_tbody = document.getElementById("main-tbody");
  main_tbody.innerHTML = ""; // очищаємо старі рядки

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const usersToShow = students.slice(start, end);

  usersToShow.forEach((user) => {
    addRow(user);
  });

  checkBox(); // якщо потрібно після додавання рядків
}

function setupPagination() {
  const pagination = document.querySelector(".pagination");
  if (!pagination) return;

  const totalPages = Math.ceil(students.length / itemsPerPage);

  // Очищаємо старі лінки
  pagination.innerHTML = "";

  // Лінки для переходу на першу і попередню сторінку
  pagination.appendChild(createPageLink("<<", 1));
  pagination.appendChild(createPageLink("<", Math.max(currentPage - 1, 1)));

  // Обмежуємо кількість сторінок, що відображаються
  let pageLinks = [];

  // Визначаємо, які сторінки відображати
  if (totalPages <= 3) {
    // Якщо сторінок менше або рівно 3, показуємо всі
    for (let i = 1; i <= totalPages; i++) {
      pageLinks.push(i);
    }
  } else {
    // Якщо сторінок більше 3, показуємо поточну сторінку, і одну сторінку до і після
    if (currentPage === 1) {
      pageLinks = [1, 2, 3];
    } else if (currentPage === totalPages) {
      pageLinks = [totalPages - 2, totalPages - 1, totalPages];
    } else {
      pageLinks = [currentPage - 1, currentPage, currentPage + 1];
    }
  }

  // Додаємо лінки для сторінок
  pageLinks.forEach((page) => {
    if (page >= 1 && page <= totalPages) {
      pagination.appendChild(createPageLink(page, page));
    }
  });

  // Лінки для переходу на наступну та останню сторінку
  pagination.appendChild(
    createPageLink(">", Math.min(currentPage + 1, totalPages))
  );
  pagination.appendChild(createPageLink(">>", totalPages));

  updatePaginationUI();
}

function createPageLink(text, pageNumber) {
  const link = document.createElement("a");
  link.href = "#";
  link.textContent = text;
  link.onclick = (e) => {
    e.preventDefault();
    currentPage = pageNumber;
    renderPage();
    setupPagination();
  };
  return link;
}

function updatePaginationUI() {
  const pagination = document.querySelector(".pagination");
  if (!pagination) return;

  const pageLinks = pagination.querySelectorAll("a");
  pageLinks.forEach((link) => {
    link.classList.remove("active");

    const text = link.textContent.trim();
    if (parseInt(text) === currentPage) {
      link.classList.add("active");
    }
  });
}

function changeDisplayFlex(elem) {
  elem.style.display =
    getComputedStyle(elem).display !== "flex" ? "flex" : "none";
}

function changeDisplayBlock(elem) {
  elem.style.display =
    getComputedStyle(elem).display !== "block" ? "block" : "none";
}

function openAdd() {
  addIS = true;
  editIs = false;
  openWind();
}

function openWind() {
  const elements = {
    addText: getElement("#add_text"),
    buttonCreate: getElement("#button-create"),
    editText: getElement("#edit_text"),
    buttonSave: getElement("#button-save"),
    wrapperShadow: getElement("#wrapper-shadow"),
    addStudent: getElement("#addStudent"),
    selectTeachers: getElement("#select-teachers"),
    selectStudents: getElement("#select-students"),
    errorTeachers: getElement("#error-teachers"),
  };

  if (addIS || editIs) {
    const isAdd = addIS;
    console.log("addIS:", addIS, "editIs:", editIs);
    console.log("isAdd:", isAdd);

    elements.addText.style.display = isAdd ? "block" : "none";
    elements.buttonCreate.style.display = isAdd ? "block" : "none";
    elements.editText.style.display = isAdd ? "none" : "block";
    elements.buttonSave.style.display = isAdd ? "none" : "block";
    const selectTeachersParent = elements.selectTeachers.closest(".form-item");
    const selectStudentsParent = elements.selectStudents.closest(".form-item");

    selectTeachersParent.style.display = isAdd ? "block" : "none";
    selectStudentsParent.style.display = isAdd ? "block" : "none";

    input_date.style.display = isAdd ? "none" : "block";
    f_name.style.display = isAdd ? "none" : "block";
    l_name.style.display = isAdd ? "none" : "block";
    select_group.style.display = isAdd ? "none" : "block";
    select_gender.style.display = isAdd ? "none" : "block";
    getElement('label[for = "input-date"]').style.display = isAdd
      ? "none"
      : "block";
    getElement('label[for = "fname"]').style.display = isAdd ? "none" : "block";
    getElement('label[for = "lname"]').style.display = isAdd ? "none" : "block";
    getElement('label[for = "select-group"]').style.display = isAdd
      ? "none"
      : "block";
    getElement('label[for = "select-gender"]').style.display = isAdd
      ? "none"
      : "block";

    if (addIS) {
      const selectedTeacherIds = currentTable.teachers.map((t) => t.id);
      const selectedStudentIds = currentTable.students.map((s) => s.id);
      loadUsersForEdit(selectedTeacherIds, selectedStudentIds);
    }

    addIS = false;
    editIs = false;
  }

  changeDisplayFlex(elements.wrapperShadow);
  changeDisplayFlex(elements.addStudent);
}

function loadUsersForEdit(selectedTeachersIds = [], selectedStudentsIds = []) {
  fetch("/Project/public/api/users.php", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Студенти:", data.students);
        console.log("Викладачі:", data.teachers);

        studentsForEdit = data.students;
        teachersForEdit = data.teachers;

        // Очищаємо обидва select'и
        selectTeachers.innerHTML = "";
        selectStudents.innerHTML = "";

        // Вчителі
        data.teachers.forEach((teacher) => {
          const option = document.createElement("option");
          option.value = teacher.id;
          option.textContent = teacher.name + " " + teacher.surname;

          if (selectedTeachersIds.includes(teacher.id)) {
            option.selected = true;
          }

          selectTeachers.appendChild(option);
        });

        $(selectTeachers)
          .select2({
            placeholder: "Select teachers",
            allowClear: true,
            width: "100%",
          })
          .trigger("change");

        // Студенти
        data.students.forEach((student) => {
          const option = document.createElement("option");
          option.value = student.id;
          option.textContent = student.name + " " + student.surname;

          if (selectedStudentsIds.includes(student.id)) {
            option.selected = true;
          }

          selectStudents.appendChild(option);
        });

        $(selectStudents)
          .select2({
            placeholder: "Select students",
            allowClear: true,
            width: "100%",
          })
          .trigger("change");
      } else {
        console.error("Помилка при завантаженні даних");
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function resetForm() {
  select_group.value = "selected";
  f_name.value = "";
  l_name.value = "";
  select_gender.value = "selected";
  input_date.value = "";
}

function closeAdd() {
  changeDisplayFlex(getElement("#wrapper-shadow"));
  changeDisplayFlex(getElement("#addStudent"));
  resetForm();
}

function closeDel() {
  changeDisplayFlex(getElement("#wrapper-shadow"));
  changeDisplayFlex(getElement("#delete-wraper"));
  clickedElemToDel = null;
  if (!getElement("#checkbox1").checked) {
    getElement("#button-del-all").style.display = "none";
  }
  all = false;
}

function openDelOne() {
  openDel();
  all = false;
  clickedElemToDel = event.target;
  const studentId = clickedElemToDel.dataset.studentId;
  const studentIndex = students.findIndex((student) => student.id == studentId);
  if (studentIndex !== -1) {
    getElement(
      "#war_text"
    ).textContent = `Are you sure you want to delete user ${students[studentIndex].name}`;
  }
}

function openDel() {
  changeDisplayFlex(getElement("#wrapper-shadow"));
  changeDisplayFlex(getElement("#delete-wraper"));
}

function createElem(tag) {
  return document.createElement(`${tag}`);
}

function butAvai(elem) {
  let parentTd = elem.parentElement.parentElement.children[6];
  let but_edit = parentTd.querySelector("#button-edit");
  let but_del = parentTd.querySelector("#button-del");
  const buts = [but_del, but_edit];

  elem.checked
    ? buts.forEach((but) => {
        but.disabled = false;
        but.style.backgroundColor = "transparent";
      })
    : buts.forEach((but) => {
        but.disabled = true;
        getElement("#checkbox1").checked = false;
        getElement("#button-del-all").style.display = "none";
        but.style.backgroundColor = "rgb(222 222 222 / 55%)";
      });

  if (elem.checked) {
    elem.checked
      ? Array.from(document.querySelectorAll('input[type="checkbox"]'))
          .splice(1)
          .forEach((but) => {
            if (but.checked) {
              getElement("#checkbox1").checked = true;
              getElement("#button-del-all").style.display = "flex";
            }
          })
      : null;
  }
}

function checkTh() {
  const elem = event.target;
  if (elem.id == "checkbox1") {
    elem.checked
      ? Array.from(document.querySelectorAll('input[type="checkbox"]'))
          .splice(1)
          .forEach((but) => {
            but.checked = true;
            butAvai(but);
            getElement("#button-del-all").style.display = "flex";
          })
      : Array.from(document.querySelectorAll('input[type="checkbox"]'))
          .splice(1)
          .forEach((but) => {
            but.checked = false;
            butAvai(but);
            getElement("#button-del-all").style.display = "none";
          });
  }
}

function delAll() {
  all = true;
  openDel();
  getElement(
    "#war_text"
  ).textContent = `Are you sure you want to delete all users`;
}

function checkBox() {
  let checkedAll = true;
  Array.from(document.querySelectorAll('input[type="checkbox"]'))
    .splice(1)
    .forEach((but) => {
      if (!but.checked) {
        checkedAll = false;
      }
    });
  if (checkedAll) {
    getElement("#button-del-all").style.display = "flex";
    getElement(`input[type="checkbox"`).checked = true;
  }
}

function addRow(new_student) {
  const main_tbody = getElement("#main-tbody");
  const new_tr = createElem("tr");

  const elements = {
    edit_but: createElem("button"),
    del_but: createElem("button"),
    but_cont: createElem("div"),
    img_edit: createElem("img"),
    img_del: createElem("img"),
    circle_status: createElem("div"),
    input: createElem("input"),
    label: createElem("label"),
  };

  elements.but_cont.className = "buttons-table";
  elements.circle_status.className = "status-circle";
  console.log(new_student.is_logged_in);
  if (new_student.is_logged_in == 1) {
    elements.circle_status.style.backgroundColor = "#4286f5";
  }

  if (currentUser.role == "admin") {
    elements.img_del.src = "./img/1214428.png";
    elements.img_del.alt = "delete";
    elements.del_but.id = "button-del";
    elements.del_but.append(elements.img_del);
    elements.but_cont.append(elements.del_but);
    elements.del_but.dataset.studentId = new_student.id;
    new_tr.dataset.studentId = new_student.id;
    elements.del_but.onclick = openDelOne;
  } else if (currentUser.role == "teacher") {
    if (new_student.role == "student") {
      elements.img_del.src = "./img/1214428.png";
      elements.img_del.alt = "delete";
      elements.del_but.id = "button-del";
      elements.del_but.dataset.studentId = new_student.id;
      new_tr.dataset.studentId = new_student.id;
      elements.del_but.onclick = openDelOne;
      elements.del_but.append(elements.img_del);
      elements.but_cont.append(elements.del_but);
    }
    if (currentUser.id == new_student.id) {
      elements.img_edit.src = "./img/2202989.webp";
      elements.img_edit.alt = "edit";
      elements.edit_but.id = "button-edit";
      new_tr.dataset.studentId = new_student.id;
      elements.edit_but.dataset.studentId = new_student.id;
      elements.edit_but.onclick = editStudent;
      elements.edit_but.append(elements.img_edit);
      elements.but_cont.append(elements.edit_but);
    }
  } else if (currentUser.role == "student") {
    if (currentUser.id == new_student.id) {
      elements.img_edit.src = "./img/2202989.webp";
      elements.img_edit.alt = "edit";
      elements.edit_but.id = "button-edit";
      new_tr.dataset.studentId = new_student.id;
      elements.edit_but.dataset.studentId = new_student.id;
      elements.edit_but.onclick = editStudent;
      elements.edit_but.append(elements.img_edit);
      elements.but_cont.append(elements.edit_but);
    }
  }

  new_tr.onclick = openInfo;
  for (let i = 0; i < 7; i++) new_tr.append(createElem("td"));

  if (currentUser.role == "admin") {
    elements.input.id = elements.label.htmlFor = `checkbox${new_student.id}`;
    elements.label.innerHTML = "hi";
    elements.label.style.fontSize = "0";
    elements.input.type = "checkbox";
    elements.input.checked = true;
    elements.input.onclick = function (event) {
      butAvai(event.target);
    };
    new_tr.children[0].append(elements.input, elements.label);
  } else if (currentUser.role == "teacher") {
    if (new_student.role == "student") {
      elements.input.id = elements.label.htmlFor = `checkbox${new_student.id}`;
      elements.label.innerHTML = "hi";
      elements.label.style.fontSize = "0";
      elements.input.type = "checkbox";
      elements.input.checked = true;
      elements.input.onclick = function (event) {
        butAvai(event.target);
      };
      new_tr.children[0].append(elements.input, elements.label);
    }
    if (currentUser.id == new_student.id) {
      elements.input.id = elements.label.htmlFor = `checkbox${new_student.id}`;
      elements.label.innerHTML = "hi";
      elements.label.style.fontSize = "0";
      elements.input.type = "checkbox";
      elements.input.checked = true;
      elements.input.onclick = function (event) {
        butAvai(event.target);
      };
      new_tr.children[0].append(elements.input, elements.label);
    }
  } else if (currentUser.role == "student") {
    if (currentUser.id == new_student.id) {
      elements.input.id = elements.label.htmlFor = `checkbox${new_student.id}`;
      elements.label.innerHTML = "hi";
      elements.label.style.fontSize = "0";
      elements.input.type = "checkbox";
      elements.input.checked = true;
      elements.input.onclick = function (event) {
        butAvai(event.target);
      };
      new_tr.children[0].append(elements.input, elements.label);
    }
  }
  [
    new_student.role == "teacher" ? "Teacher" : new_student.group,
    new_student.name + " " + new_student.surname,
    new_student.gender,
    new_student.birthday,
  ].forEach((text, i) => (new_tr.children[i + 1].textContent = text));
  new_tr.children[5].append(elements.circle_status);
  new_tr.children[6].append(elements.but_cont);

  main_tbody.append(new_tr);
  checkBox();
}

function checkBirthday(elem) {
  let date = elem.value;
  let block = elem.nextElementSibling;

  let datePattern =
    /^(19[1-9]\d|20[0-2]\d|2025)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

  let [year, month, day] = date.split("-").map(Number);
  let currentYear = new Date().getFullYear();
  if (year < currentYear - 80 || year > currentYear - 16) {
    block.style.display = "block";
    block.textContent = `Enter the year from [${currentYear - 80}; ${
      currentYear - 16
    }]`;
    return false;
  }

  if (!datePattern.test(date)) {
    block.style.display = "block";
    block.textContent = "Invalid date format. Use MM-DD-YYYY.";
    return false;
  }

  let daysInMonth = new Date(year, month, 0).getDate();

  if (day > daysInMonth) {
    block.style.display = "block";
    block.textContent = `Enter the day from [01; ${daysInMonth}]`;
    return false;
  }

  block.style.display = "none";
  return true;
}

function checkEmail(elem) {
  let email = elem.value;
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  let block = elem.nextElementSibling;
  if (!pattern.test(email)) {
    console.log(block);
    block.style.display = "block";
    block.style.textContent = "Enter name that have min 2 letter and only them";
    return false;
  } else {
    block.style.display = "none";
    return true;
  }
}

function checkName(elem) {
  let name = elem.value;
  const pattern = /^[A-Z]{1}[a-z-]{2,20}(\s*[A-Z]{1}[a-z-]{2,20})?$/;
  let block = elem.nextElementSibling;
  if (!pattern.test(name)) {
    console.log(block);
    block.style.display = "block";
    block.style.textContent = "Enter name that have min 2 letter and only them";
    return false;
  } else {
    block.style.display = "none";
    return true;
  }
}

function checkSurname(elem) {
  let surname = elem.value;
  console.log("hi");
  const pattern = /^[A-Z]{1}[a-z]{2,20}(\s*[A-Z]{1}[a-z]{2,20})?$/;
  let block = elem.nextElementSibling;
  console.log(pattern.test(surname));
  if (!pattern.test(surname)) {
    console.log(block);
    block.style.display = "block";
    block.style.textContent =
      "Enter surname that have min 2 letter and only them";
    return false;
  } else {
    block.style.display = "none";
    return true;
  }
}

function checkValidForm(elem) {
  console.log(elem);
  let form = document.getElementById("form-add");

  let groupSelect = form.querySelector("#select-group");
  let blockGroup = groupSelect
    .closest(".form-item")
    .querySelector(".block-error");

  let genderSelect = form.querySelector("#select-gender");
  let blockGender = genderSelect
    .closest(".form-item")
    .querySelector(".block-error");

  if (select_group.value == "selected") {
    blockGroup.style.display = "block";
    return false;
  } else {
    blockGroup.style.display = "none";
  }

  if (select_gender.value == "selected") {
    blockGender.style.display = "block";
    return false;
  } else {
    blockGender.style.display = "none";
  }

  console.log("hi", getElement("#fname"));
  return (
    select_group.value != "selected" &&
    checkName(getElement("#fname")) &&
    checkSurname(getElement("#lname")) != "" &&
    select_gender.value != "selected" &&
    checkBirthday(getElement("#input-date"))
  );
}

function checkTeachers(elem) {
  const selectedTeachers = $(selectTeachers).val();
  const errorBlock = document.getElementById("error-teachers");

  if (selectedTeachers.length > 0) {
    errorBlock.style.display = "none";
  }
}

function checkForm(event) {
  if (currentTable) {
    const selectTeachers = document.getElementById("select-teachers");
    const selectStudents = document.getElementById("select-students");
    const errorBlock = document.getElementById("error-teachers");

    const selectedTeacherIds = $(selectTeachers)
      .val()
      .map((id) => parseInt(id));
    const selectedStudentIds = $(selectStudents)
      .val()
      .map((id) => parseInt(id));

    if (selectedTeacherIds.length === 0) {
      errorBlock.style.display = "block";
      errorBlock.textContent = "Please select at least one teacher.";
      return false;
    } else {
      errorBlock.style.display = "none";
    }

    const name = currentTable.name; // якщо назва оновлюється

    currentTable.teachers = selectedTeacherIds
      .map((id) => {
        return teachersForEdit.find((t) => parseInt(t.id) === id);
      })
      .filter(Boolean); // забираємо null, якщо раптом не знайдеться

    currentTable.students = selectedStudentIds
      .map((id) => {
        return studentsForEdit.find((s) => parseInt(s.id) === id);
      })
      .filter(Boolean);

    localStorage.setItem("currentTable", JSON.stringify(currentTable));

    updateTable(currentTable.id, name, selectedTeacherIds, selectedStudentIds);
    location.reload();
  }
}

function delStudent() {
  if (all) {
    const table = document.querySelector("table");
    const rows = table.querySelectorAll("tr");

    const idsToDelete = [];

    rows.forEach((row, index) => {
      if (index !== 0) {
        const delButton = row.querySelector("#button-del");
        if (delButton) {
          const studentId = parseInt(row.dataset.studentId);
          idsToDelete.push(studentId);
        }
      }
    });

    // Тепер масово фільтруємо
    students = students.filter((student) => !idsToDelete.includes(student.id));
    tableStudents = tableStudents.filter(
      (student) => !idsToDelete.includes(student.id)
    );
    tableTeachers = tableTeachers.filter(
      (teacher) => !idsToDelete.includes(teacher.id)
    );

    // Оновлюємо currentTable
    currentTable.students = tableStudents;
    currentTable.teachers = tableTeachers;
    localStorage.setItem("currentTable", JSON.stringify(currentTable));

    const selectedTeacherIds = tableTeachers.map((t) => parseInt(t.id));
    const selectedStudentIds = tableStudents.map((s) => parseInt(s.id));

    updateTable(
      currentTable.id,
      currentTable.name,
      selectedTeacherIds,
      selectedStudentIds
    );

    // І тільки потім видаляємо рядки з таблиці
    rows.forEach((row, index) => {
      if (index !== 0) {
        const delButton = row.querySelector("#button-del");
        if (delButton) {
          row.remove();
        }
      }
    });

    getElement("#checkbox1").checked = false;
  } else {
    if (clickedElemToDel.id === "button-del") {
      const studentId = parseInt(clickedElemToDel.dataset.studentId);
      event.stopPropagation();

      const rowToDelete = clickedElemToDel.closest("tr");
      rowToDelete.remove();

      const studentIndex = students.findIndex(
        (student) => student.id === studentId
      );
      if (studentIndex !== -1) {
        students.splice(studentIndex, 1);
      }

      const tableStudentIndex = tableStudents.findIndex(
        (student) => student.id === studentId
      );
      if (tableStudentIndex !== -1) {
        tableStudents.splice(tableStudentIndex, 1);
      }

      const tableTeacherIndex = tableTeachers.findIndex(
        (teacher) => teacher.id === studentId
      );
      if (tableTeacherIndex !== -1) {
        tableTeachers.splice(tableTeacherIndex, 1);
      }

      currentTable.students = tableStudents;
      currentTable.teachers = tableTeachers;
      localStorage.setItem("currentTable", JSON.stringify(currentTable));

      const selectedTeacherIds = tableTeachers.map((t) => parseInt(t.id));
      const selectedStudentIds = tableStudents.map((s) => parseInt(s.id));

      updateTable(
        currentTable.id,
        currentTable.name,
        selectedTeacherIds,
        selectedStudentIds
      );

      console.log(`Student with ID: ${studentId} removed from the list`);
    }
  }
  saveStudentsToLocalStorage();
  closeDel();
}

function updateTable(id, name, selectedTeacherIds, selectedStudentIds) {
  fetch("/Project/public/api/updateTable.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id,
      name: name,
      teachers: selectedTeacherIds, // масив айді викладачів
      students: selectedStudentIds, // масив айді студентів
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Таблицю оновлено успішно!");

        // location.reload();
      } else {
        console.error("Помилка оновлення таблиці:", data.message);
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function editStudent() {
  const clickedElem = event.target;
  if (clickedElem.id === "button-edit") {
    const studentId = clickedElem.dataset.studentId;
    event.stopPropagation();

    const studentIndex = students.findIndex(
      (student) => student.id == studentId
    );
    if (studentIndex !== -1) {
      student = students[studentIndex];
      select_group.value = student.group;
      f_name.value = student.name;
      l_name.value = student.surname;
      select_gender.value = student.gender;
      input_date.value = student.birthday;

      addIS = false;
      editIs = true;
      openWind();
    }
  }
}

function saveForm() {
  if (checkValidForm()) {
    student.group = select_group.value;
    student.name = f_name.value;
    student.surname = l_name.value;
    student.gender = select_gender.value;
    student.birthday = input_date.value;
    editRow(student);
    resetForm();
    changeDisplayFlex(getElement("#wrapper-shadow"));
    changeDisplayFlex(getElement("#addStudent"));
    student = null;
  }
}

function editRow(student) {
  const btnArray = Array.from(document.querySelectorAll("#button-edit"));

  const rowIndex = btnArray.findIndex(
    (btn) => btn.dataset.studentId == student.id
  );

  console.log("Row index:", student.id);
  if (rowIndex !== -1) {
    // Підготовка даних для запиту
    const requestData = {
      id: student.id,
      group: student.group,
      name: student.name,
      surname: student.surname,
      gender: student.gender,
      birthday: student.birthday,
      is_logged_in: student.is_logged_in,
      role: student.role,
      password: student.password,
      email: student.email,
    };

    // Надсилаємо запит на оновлення користувача в базі
    fetch("/Project/public/api/updateUser.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Користувач оновлений в базі даних!");

          // Оновлюємо в students
          students[rowIndex].group = student.group;
          students[rowIndex].name = student.name;
          students[rowIndex].surname = student.surname;
          students[rowIndex].gender = student.gender;
          students[rowIndex].birthday = student.birthday;

          // Оновлюємо в tableStudents
          const tableStudentIndex = tableStudents.findIndex(
            (s) => s.id == student.id
          );
          if (tableStudentIndex !== -1) {
            tableStudents[tableStudentIndex].group = student.group;
            tableStudents[tableStudentIndex].name = student.name;
            tableStudents[tableStudentIndex].surname = student.surname;
            tableStudents[tableStudentIndex].gender = student.gender;
            tableStudents[tableStudentIndex].birthday = student.birthday;
          }

          // Оновлюємо в tableTeachers
          const tableTeacherIndex = tableTeachers.findIndex(
            (t) => t.id == student.id
          );
          if (tableTeacherIndex !== -1) {
            tableTeachers[tableTeacherIndex].group = student.group;
            tableTeachers[tableTeacherIndex].name = student.name;
            tableTeachers[tableTeacherIndex].surname = student.surname;
            tableTeachers[tableTeacherIndex].gender = student.gender;
            tableTeachers[tableTeacherIndex].birthday = student.birthday;
          }

          // Оновлюємо currentTable
          currentTable.students = tableStudents;
          currentTable.teachers = tableTeachers;
          localStorage.setItem("currentTable", JSON.stringify(currentTable));

          // Якщо редагуємо currentUser
          if (currentUser && currentUser.id == student.id) {
            currentUser.group = student.group;
            currentUser.name = student.name;
            currentUser.surname = student.surname;
            currentUser.gender = student.gender;
            currentUser.birthday = student.birthday;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
          }

          // Оновлюємо рядок таблиці в DOM
          const row = btnArray[rowIndex].closest("tr");
          [
            student.group,
            student.name + " " + student.surname,
            student.gender,
            student.birthday,
          ].forEach((text, i) => (row.children[i + 1].textContent = text));

          saveStudentsToLocalStorage();
          console.log(
            "Оновлений студент:",
            JSON.stringify(students[rowIndex], null, 2)
          );
        } else {
          if (data.errors && data.errors.length > 0) {
            console.error("Помилки при оновленні користувача:", data.errors);
            alert("Помилки при оновленні: " + data.errors.join(", "));
          } else {
            console.error("Невідома помилка при оновленні користувача");
            alert("Сталася помилка при оновленні користувача");
          }
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        alert("Сталася помилка при оновленні користувача");
      });
  } else {
    console.log("Student not found");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const observer = new MutationObserver(() => {
    let notif = document.getElementById("sign-not");
    if (notif) {
      observer.disconnect();
      if (localStorage.getItem("notifHidden") === "true")
        notif.style.display = "none";
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
});

function hideNotif() {
  let notif = getElement("#sign-not");
  if (notif) {
    notif.style.display = "none";
    localStorage.setItem("notifHidden", "true");
  }
}

function bell() {
  document
    .getElementById("bell")
    .animate(
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(15deg)" },
        { transform: "rotate(-15deg)" },
        { transform: "rotate(10deg)" },
        { transform: "rotate(-10deg)" },
        { transform: "rotate(0deg)", offset: 0.5 },
      ],
      {
        duration: 1500,
        iterations: 1,
      }
    );
  localStorage.setItem("notifHidden", "false");
  let notif = getElement("#sign-not");
  notif.style.display = "block";
}

function okClick() {
  addIS ? (checkValidForm() ? checkForm() : closeAdd()) : closeAdd();
}

function burgerMenu() {
  document.querySelector("aside").classList.toggle("open");
}

function closeInfo() {
  changeDisplayFlex(getElement("#wrapper-shadow"));
  changeDisplayFlex(getElement("#info-student-wraper"));
}

function openInfo(event) {
  const { target, currentTarget } = event;
  const studentId = currentTarget.dataset.studentId;
  if (window.innerWidth >= 850 || target.id === "button-del") {
    return;
  }
  const student = students.find((student) => student.id == studentId);
  if (!student) return;
  const elements = {
    group_det: getElement("#group-det"),
    username_det: getElement("#username-det"),
    gender_det: getElement("#gender-det"),
    birthday_det: getElement("#birthday-det"),
    status_det: getElement("#status-det"),
  };
  changeDisplayFlex(getElement("#wrapper-shadow"));
  changeDisplayFlex(getElement("#info-student-wraper"));
  elements.group_det.innerHTML = `<span class="info-cap">Group: </span>${student.group}`;
  elements.username_det.innerHTML = `<span class="info-cap">Name: </span>${student.name}`;
  elements.gender_det.innerHTML = `<span class="info-cap">Gender: </span>${student.gender}`;
  elements.birthday_det.innerHTML = `<span class="info-cap">Birthday: </span>${student.birthday}`;
  elements.status_det.innerHTML = `<span class="info-cap">Status: </span>${
    student.is_logged_in ? "Online" : "Offline"
  }`;
}

function openAuthForm() {
  changeDisplayFlex(getElement("#wrapper-shadow"));
  changeDisplayFlex(getElement("#authForm-wraper"));
}
