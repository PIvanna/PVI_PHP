const getElement = document.querySelector.bind(document);

const button_subject = getElement("#button-subject");
const wrapper_shadow = getElement("#wrapper-shadow");
const addTable = getElement("#addTable");
const selectTeachers = getElement("#select-teachers");
const selectStudents = getElement("#select-students");
const name_subject = getElement("#name_subject");
const add_table_subject = getElement("#add-table-subject");
const edit_table_subject = getElement("#edit-table-subject");
const button_edit = getElement("#button-edit");
const button_create = getElement("#button-create");
const create_table = getElement("#create-table");

let students = [];
let teachers = [];

let tables = [];
let currentTableId = null; // Змінна для зберігання ID поточної таблиці

class Table {
  constructor(name, students, teachers) {
    this.name = name;
    this.students = students;
    this.teachers = teachers;
  }
}

function burgerMenu() {
  document.querySelector("aside").classList.toggle("open");
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

        students = data.students;
        teachers = data.teachers;

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

function openCreateTable() {
  wrapper_shadow.style.display = "block";
  addTable.style.display = "flex";
  add_table_subject.style.display = "block";
  edit_table_subject.style.display = "none";
  button_create.style.display = "block";
  button_edit.style.display = "none";
  loadUsersForEdit([], []);
}

function closeAdd() {
  wrapper_shadow.style.display = "none";
  addTable.style.display = "none";
}

function resetFormTable() {
  selectStudents.innerHTML = "";
  selectTeachers.innerHTML = "";
}

function checkTeachers(elem) {
  const selectedTeachers = $(selectTeachers).val();
  const errorBlock = document.getElementById("error-teachers");

  if (selectedTeachers.length > 0) {
    errorBlock.style.display = "none";
  }
}

function checkNameSubject(elem) {
  let name = elem.value;
  let block = elem.nextElementSibling;

  if (name.length < 3) {
    block.style.display = "block";
    block.textContent = "The name must have at least 3 characters.";
    return false;
  }

  if (!name.match(/^[A-Z]/)) {
    block.style.display = "block";
    block.textContent = "The name must start with a capital letter.";
    return false;
  }

  const pattern = /^[A-Z][a-zA-Z -]{2,20}$/;
  if (!name.match(pattern)) {
    block.style.display = "block";
    block.textContent =
      "The name can only contain letters, spaces, and hyphens, and must start with a capital letter.";
    return false;
  }

  block.style.display = "none";
  return true;
}

function checkFormSubject() {
  const selectTeachers = document.getElementById("select-teachers");
  const errorBlock = document.getElementById("error-teachers");
  const selectedTeachers = $(selectTeachers).val();

  if (selectedTeachers.length === 0) {
    errorBlock.style.display = "block";
    errorBlock.textContent = "Please select at least one teacher.";
    return false;
  } else {
    errorBlock.style.display = "none";
  }

  if (!checkNameSubject(name_subject)) {
    return false;
  }

  let table = new Table(
    name_subject.value,
    $(selectStudents).val(),
    $(selectTeachers).val()
  );

  fetch("/Project/public/api/tables.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: table.name,
      students: table.students,
      teachers: table.teachers,
    }),
  })
    .then((response) => {
      console.log("Response received:", response);
      return response.json();
    })
    .then((data) => {
      console.log("Response data:", data);
      if (data.success) {
        console.log("Table created successfully");

        tables.push(table);
        location.reload();
      } else {
        alert("Error:", data.message);
        return false;
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function renderTables(tables) {
  const tablesContainer = document.querySelector(".all-tables-subjects");

  tablesContainer.innerHTML = "";

  if (tables.length === 0) {
    tablesContainer.innerHTML = `<p class="font-Monomakh">No tables available</p>`;
  } else {
    tables.forEach((table) => {
      const teacherNames = table.teachers
        .map((teacher) => `${teacher.name} ${teacher.surname}`)
        .join(", ");

      const studentNames = table.students
        .map((student) => `${student.name} ${student.surname}`)
        .join(", ");

      const tableElement = document.createElement("div");
      tableElement.classList.add("table-subjects");
      tableElement.dataset.id = table.id;
      tableElement.onclick = function (event) {
        console.log(event.target);
        const but_delete = event.target.closest(".button-manage");
        console.log(but_delete);
        event.stopPropagation(); // Зупиняємо подію кліку на батьківському елементі
        if (event.target !== but_delete) {
          const clickedTableId = this.dataset.id;
          const currentTable = tables.find((t) => t.id == clickedTableId);
          if (currentTable) {
            localStorage.setItem("currentTable", JSON.stringify(currentTable));
            window.location.href = "http://localhost/Project/public/index.php";
          } else {
            console.error("Table not found!");
          }
        } else if (but_delete.textContent === "Edit") {
        } else {
          location.reload();
        }
      };
      tableElement.innerHTML = `
                      <div class="table-subjects-header">
                          <h3 class = "table-name">${table.name}</h3>
                          <div class="button-group">
                              <button type="button" onclick="openEdit(this)" class="font-Monomakh button-manage">Edit</button>
                              <button type="button" onclick="deleteTable(this)" class="font-Monomakh button-manage">Delete</button>
                          </div>
                      </div>
                      <div class="table-subjects-body">
                          <p>Teachers: ${teacherNames}</p>
                          <p>Students: ${studentNames}</p>
                      </div>
                  `;

      tablesContainer.appendChild(tableElement);
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("/Project/public/api/convert.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Response data:", data);
      if (data.success) {
        console.log("Tables with users:", data.data);
        let loadedTables = data.data;

        if (currentUser.role === "admin") {
          tables = loadedTables;
        } else if (
          currentUser.role === "student" ||
          currentUser.role === "teacher"
        ) {
          tables = loadedTables.filter((table) => {
            const userId = currentUser.id;
            const isTeacher = table.teachers.some(
              (teacher) => teacher.id == userId
            );
            const isStudent = table.students.some(
              (student) => student.id == userId
            );
            return isTeacher || isStudent;
          });
        }

        renderTables(tables);

        if (currentUser.role === "student") {
          document.querySelectorAll(".button-manage").forEach((button) => {
            button.style.display = "none";
          });
          create_table.style.display = "none";
        }

        if (currentUser.role === "teacher") {
          const buttons = document.querySelectorAll(".button-manage");

          for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].textContent === "Delete") {
              buttons[i].style.display = "none";
            }
          }
        }
      } else {
        alert("Error: " + data.message);
        return false;
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
});

function deleteTable(elem) {
  const tableId = elem.closest(".table-subjects").dataset.id;
  if (confirm("Are you sure you want to delete this table?")) {
    fetch("/Project/public/api/deleteTable.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: parseInt(tableId) }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Table deleted successfully");

          // Видаляємо елемент із DOM
          elem.closest(".table-subjects").remove();

          // Можна також оновити масив tables, якщо треба
          tables = tables.filter((t) => t.id !== parseInt(tableId));
        } else {
          alert("Error deleting table: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  }
}

function openEdit(elem) {
  wrapper_shadow.style.display = "block";
  addTable.style.display = "flex";
  add_table_subject.style.display = "none";
  edit_table_subject.style.display = "block";
  button_create.style.display = "none";
  button_edit.style.display = "block";

  const tableId = elem.closest(".table-subjects").dataset.id;
  const table = tables.find((t) => t.id === parseInt(tableId));

  if (table) {
    name_subject.value = table.name;

    const selectedTeacherIds = table.teachers.map((t) => t.id);
    const selectedStudentIds = table.students.map((s) => s.id);

    currentTableId = tableId; // Зберігаємо ID поточної таблиці
    loadUsersForEdit(selectedTeacherIds, selectedStudentIds);
  } else {
    console.error("Table with the specified ID not found.");
  }
}

function editFormSubject(event) {
  const selectTeachers = document.getElementById("select-teachers");
  const errorBlock = document.getElementById("error-teachers");
  const selectedTeachers = $(selectTeachers).val();

  if (selectedTeachers.length === 0) {
    errorBlock.style.display = "block";
    errorBlock.textContent = "Please select at least one teacher.";
    return false;
  } else {
    errorBlock.style.display = "none";
  }

  if (!checkNameSubject(name_subject)) {
    return false;
  }

  const name = name_subject.value; // припустимо, у тебе тут інпут назви
  const selectedTeacherIds = $(selectTeachers)
    .val()
    .map((id) => parseInt(id));
  const selectedStudentIds = $(selectStudents)
    .val()
    .map((id) => parseInt(id));

  updateTable(currentTableId, name, selectedTeacherIds, selectedStudentIds);
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

        location.reload();
      } else {
        console.error("Помилка оновлення таблиці:", data.message);
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function expandSelect(select) {
  console.log('gi')
  select.size = 1; // показати 5 рядків наприклад
}

function collapseSelect(select) {
  select.size = 1; // повернути назад в компактний режим
}

$(document).ready(function() {
  $('#select-teachers').select2();
  $('#select-students').select2();

  // Коли відкрито селект
  $('#select-teachers').on('select2:open', function() {
    $('.select2-container').addClass('expanded');
    $('.select2-selection__rendered').addClass('expanded');
  });

  // Коли закрито селект
  $('#select-teachers').on('select2:close', function() {
    $('.select2-container').removeClass('expanded');
    $('.select2-selection__rendered').removeClass('expanded');
  });

  $('#select-students').on('select2:open', function() {
    $('.select2-container').addClass('expanded');
    $('.select2-selection__rendered').addClass('expanded');
  });

  $('#select-students').on('select2:close', function() {
    $('.select2-container').removeClass('expanded');
    $('.select2-selection__rendered').removeClass('expanded');
  });
});
