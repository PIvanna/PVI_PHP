// table.js

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
const create_table = getElement("#create-table"); // Переконайтеся, що цей ID існує в HTML

let students = [];
let teachers = [];

let tables = []; // Ця змінна буде оновлюватися після завантаження
let currentTableId = null;

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
        // console.log("Студенти:", data.students);
        // console.log("Викладачі:", data.teachers);

        // Зберігаємо глобально, якщо потрібно для інших функцій, але краще передавати
        // students = data.students;
        // teachers = data.teachers;

        // Очищаємо обидва select'и
        if (selectTeachers) selectTeachers.innerHTML = "";
        if (selectStudents) selectStudents.innerHTML = "";

        // Вчителі
        if (selectTeachers) {
            data.teachers.forEach((teacher) => {
                const option = document.createElement("option");
                option.value = teacher.id;
                option.textContent = teacher.name + " " + teacher.surname;
                if (selectedTeachersIds.includes(String(teacher.id)) || selectedTeachersIds.includes(Number(teacher.id))) { // Порівнюємо і як рядок, і як число
                    option.selected = true;
                }
                selectTeachers.appendChild(option);
            });
            $(selectTeachers).select2({ placeholder: "Select teachers", allowClear: true, width: "100%" }).trigger("change");
        }

        // Студенти
        if (selectStudents) {
            data.students.forEach((student) => {
                const option = document.createElement("option");
                option.value = student.id;
                option.textContent = student.name + " " + student.surname;
                 if (selectedStudentsIds.includes(String(student.id)) || selectedStudentsIds.includes(Number(student.id))) {
                    option.selected = true;
                }
                selectStudents.appendChild(option);
            });
            $(selectStudents).select2({ placeholder: "Select students", allowClear: true, width: "100%" }).trigger("change");
        }
      } else {
        console.error("Помилка при завантаженні користувачів для редагування:", data.message);
      }
    })
    .catch((error) => {
      console.error("Fetch error (loadUsersForEdit):", error);
    });
}

function openCreateTable() {
  if (wrapper_shadow) wrapper_shadow.style.display = "block";
  if (addTable) addTable.style.display = "flex";
  if (add_table_subject) add_table_subject.style.display = "block";
  if (edit_table_subject) edit_table_subject.style.display = "none";
  if (button_create) button_create.style.display = "block";
  if (button_edit) button_edit.style.display = "none";
  if (name_subject) name_subject.value = ""; // Очистити поле назви
  loadUsersForEdit([], []);
}

function closeAdd() {
  if (wrapper_shadow) wrapper_shadow.style.display = "none";
  if (addTable) addTable.style.display = "none";
  // Скидання значень select2 при закритті модального вікна
  if (selectTeachers) $(selectTeachers).val(null).trigger('change');
  if (selectStudents) $(selectStudents).val(null).trigger('change');
  if (name_subject) name_subject.value = "";
}

// function resetFormTable() { // Ймовірно, не потрібна, якщо closeAdd скидає select2
//   if (selectStudents) selectStudents.innerHTML = "";
//   if (selectTeachers) selectTeachers.innerHTML = "";
// }

function checkTeachers(elem) {
  const selectedTeachersValues = $(selectTeachers).val(); // $(elem).val() або $(selectTeachers).val()
  const errorBlock = document.getElementById("error-teachers");
  if (errorBlock) {
    if (selectedTeachersValues && selectedTeachersValues.length > 0) {
        errorBlock.style.display = "none";
    } else {
        // Можна показувати помилку тут, якщо потрібно при зміні
    }
  }
}

function checkNameSubject(elem) {
  if (!elem) return false;
  let name = elem.value;
  let block = elem.nextElementSibling;
  if (!block || !block.classList.contains('error-message')) { // Додайте клас помилки для надійності
      block = null; // Якщо немає елемента помилки
  }


  if (name.length < 3) {
    if(block) {
        block.style.display = "block";
        block.textContent = "The name must have at least 3 characters.";
    }
    return false;
  }

  if (!name.match(/^[A-ZА-ЯІЇЄ]/)) { // Додано українські великі літери
    if(block) {
        block.style.display = "block";
        block.textContent = "The name must start with a capital letter.";
    }
    return false;
  }

  const pattern = /^[A-ZА-ЯІЇЄ][a-zA-Zа-яА-ЯіІїЇєЄ' -]{2,29}$/; // Дозволено апостроф, збільшено довжину
  if (!name.match(pattern)) {
    if(block) {
        block.style.display = "block";
        block.textContent =
        "Invalid characters or length (3-30). Must start with a capital letter.";
    }
    return false;
  }

  if(block) block.style.display = "none";
  return true;
}

function checkFormSubject() { // Для створення нової таблиці
  const errorBlockTeachers = document.getElementById("error-teachers");
  const selectedTeachersValues = $(selectTeachers).val();

  let isValid = true;

  if (!selectedTeachersValues || selectedTeachersValues.length === 0) {
    if(errorBlockTeachers) {
        errorBlockTeachers.style.display = "block";
        errorBlockTeachers.textContent = "Please select at least one teacher.";
    }
    isValid = false;
  } else {
    if(errorBlockTeachers) errorBlockTeachers.style.display = "none";
  }

  if (!checkNameSubject(name_subject)) {
    isValid = false;
  }

  if (!isValid) return false; // Зупинити, якщо є помилки валідації

  const studentsVal = $(selectStudents).val() || []; // Переконатися, що це масив
  const teachersVal = $(selectTeachers).val() || []; // Переконатися, що це масив

  let newTablePayload = {
    name: name_subject.value,
    students: studentsVal.map(id => parseInt(id)), // Перетворити на числа, якщо потрібно
    teachers: teachersVal.map(id => parseInt(id))
  };

  fetch("/Project/public/api/tables.php", { // Ендпоінт для СТВОРЕННЯ
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTablePayload),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Table created successfully", data);
        // Сервер може повернути створену таблицю з ID
        // tables.push(data.table || newTablePayload); // Додати до локального списку
        closeAdd();
        location.reload(); // Або оновити список таблиць динамічно
      } else {
        alert("Error creating table: " + (data.message || "Unknown error"));
      }
    })
    .catch((error) => {
      console.error("Fetch error (checkFormSubject):", error);
      alert("An error occurred while creating the table.");
    });
    return false; // Для запобігання стандартній відправці форми, якщо це <form>
}

function renderTables(tablesToRender, currentUserForRender) {
  const tablesContainer = document.querySelector(".all-tables-subjects");
  if (!tablesContainer) {
      console.error("RenderTables: Container .all-tables-subjects not found!");
      return;
  }
  tablesContainer.innerHTML = "";

  if (!tablesToRender || tablesToRender.length === 0) {
    tablesContainer.innerHTML = `<p class="font-Monomakh">No tables available</p>`;
    return;
  }

  tablesToRender.forEach((table) => {
    const teacherNames = Array.isArray(table.teachers)
      ? table.teachers.map((teacher) => `${teacher.name} ${teacher.surname}`).join(", ")
      : "N/A";

    const studentNames = Array.isArray(table.students)
      ? table.students.map((student) => `${student.name} ${student.surname}`).join(", ")
      : "N/A";

    const tableElement = document.createElement("div");
    tableElement.classList.add("table-subjects");
    tableElement.dataset.id = table.id;

    tableElement.addEventListener('click', function(event) {
      if (event.target.closest('.button-manage')) {
        event.stopPropagation();
        return;
      }
      const clickedTableId = this.dataset.id;
      // `tables` - глобальна змінна, що містить повний список завантажених таблиць
      const currentTableData = tables.find((t) => String(t.id) === String(clickedTableId));
      if (currentTableData) {
        localStorage.setItem("currentTable", JSON.stringify(currentTableData));
        window.location.href = "/Project/public/index.php"; // Або інший URL
      } else {
        console.error("Table not found for navigation! ID:", clickedTableId);
      }
    });

    let manageButtonsHTML = '';
    if (currentUserForRender) {
        if (currentUserForRender.role === 'admin') {
            manageButtonsHTML = `
                <button type="button" onclick="openEdit(this)" class="font-Monomakh button-manage">Edit</button>
                <button type="button" onclick="deleteTable(this)" class="font-Monomakh button-manage">Delete</button>
            `;
        } else if (currentUserForRender.role === 'teacher') {
            // Перевірка, чи поточний викладач є частиною цієї таблиці
            const isCurrentUserTeacherInThisTable = Array.isArray(table.teachers) && 
                table.teachers.some(t => String(t.id) === String(currentUserForRender.id));
            if (isCurrentUserTeacherInThisTable) {
                 manageButtonsHTML = `<button type="button" onclick="openEdit(this)" class="font-Monomakh button-manage">Edit</button>`;
            }
        }
        // Студенти не мають кнопок управління
    }


    tableElement.innerHTML = `
        <div class="table-subjects-header">
            <h3 class="table-name">${table.name || "Unnamed Table"}</h3>
            <div class="button-group">
                ${manageButtonsHTML}
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


// --- ГОЛОВНА ЛОГІКА ІНІЦІАЛІЗАЦІЇ ТАБЛИЦЬ ---
function initializePageWithTables(currentUserData) {
  if (!currentUserData) {
    console.error("TABLE.JS (initializePageWithTables): currentUserData is null/undefined. Cannot load tables.");
    renderTables([], null); // Показати "No tables available"
    if (create_table) create_table.style.display = "none";
    return;
  }

  console.log("TABLE.JS (initializePageWithTables): Initializing with user:", currentUserData);

  fetch("/Project/public/api/convert.php", { // Ваш ендпоінт для отримання таблиць
    method: "POST", // Або GET, залежно від вашого API
    headers: {
      "Content-Type": "application/json",
    },
    // body: JSON.stringify({ userId: currentUserData.id }) // Якщо API потребує ID користувача
  })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (data.success && Array.isArray(data.data)) {
        console.log("TABLE.JS: Tables loaded successfully:", data.data);
        let loadedTables = data.data;
        let filteredTables = [];

        if (currentUserData.role === "admin") {
          filteredTables = loadedTables;
        } else if (currentUserData.role === "student" || currentUserData.role === "teacher") {
          filteredTables = loadedTables.filter((table) => {
            const userId = String(currentUserData.id); // Порівнювати як рядки для надійності
            const isTeacher = Array.isArray(table.teachers) && table.teachers.some(
              (teacher) => String(teacher.id) === userId
            );
            const isStudent = Array.isArray(table.students) && table.students.some(
              (student) => String(student.id) === userId
            );
            return isTeacher || isStudent;
          });
        }
        
        tables = loadedTables; // Зберігаємо ВСІ завантажені таблиці глобально (для openEdit)
        renderTables(filteredTables, currentUserData); // Відображаємо відфільтровані

        // Налаштування UI на основі ролі
        if (create_table) { // Кнопка "Create Table"
             // Показувати кнопку створення для адмінів та викладачів
            if (currentUserData.role === "admin" || currentUserData.role === "teacher") {
                create_table.style.display = "block"; // Або ваш стиль
            } else {
                create_table.style.display = "none";
            }
        }

      } else {
        console.error("TABLE.JS: Failed to load tables or incorrect data format.", data.message || data);
        renderTables([], currentUserData); // Показати "No tables available"
        if (create_table) create_table.style.display = "none";
      }
    })
    .catch((error) => {
      console.error("TABLE.JS: Fetch error while loading tables:", error);
      renderTables([], currentUserData); // Показати "No tables available"
      if (create_table) create_table.style.display = "none";
    });
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("TABLE.JS (DOMContentLoaded): Waiting for 'currentUserReady' or checking localStorage.");
  
  const localCurrentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (localCurrentUser) {
    console.log("TABLE.JS (DOMContentLoaded): Found currentUser in localStorage, initializing.");
    initializePageWithTables(localCurrentUser);
  } else {
    console.log("TABLE.JS (DOMContentLoaded): currentUser not in localStorage, waiting for 'currentUserReady' event.");
  }

  document.addEventListener('currentUserReady', function (event) {
    console.log("TABLE.JS: Received 'currentUserReady' event.");
    const eventCurrentUser = event.detail;
    // Перевіряємо, чи об'єкт користувача дійсно є і має властивості
    if (eventCurrentUser && typeof eventCurrentUser === 'object' && eventCurrentUser.id) {
        initializePageWithTables(eventCurrentUser);
    } else {
        console.warn("TABLE.JS: 'currentUserReady' event received, but event.detail is invalid or empty.", eventCurrentUser);
        // Можливо, варто показати повідомлення про помилку або стан "гість"
        initializePageWithTables(null); // Або обробити як відсутність користувача
    }
  });
});

function deleteTable(elem) {
  const tableElement = elem.closest(".table-subjects");
  if (!tableElement) {
      console.error("DeleteTable: Could not find parent .table-subjects element.");
      return;
  }
  const tableId = tableElement.dataset.id;

  if (confirm("Are you sure you want to delete this table?")) {
    fetch("/Project/public/api/deleteTable.php", {
      method: "POST", // Або DELETE, якщо ваш сервер підтримує
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: parseInt(tableId) }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Table deleted successfully");
          tableElement.remove(); // Видаляємо елемент із DOM
          // Оновлюємо глобальний масив tables
          tables = tables.filter((t) => String(t.id) !== String(tableId));
        } else {
          alert("Error deleting table: " + (data.message || "Unknown error"));
        }
      })
      .catch((error) => {
        console.error("Fetch error (deleteTable):", error);
        alert("An error occurred while deleting the table.");
      });
  }
}

function openEdit(elem) {
  const tableElement = elem.closest(".table-subjects");
   if (!tableElement) {
      console.error("OpenEdit: Could not find parent .table-subjects element.");
      return;
  }
  const tableIdToEdit = tableElement.dataset.id;
  // Шукаємо в глобальному масиві `tables`, який містить повні дані
  const tableToEdit = tables.find((t) => String(t.id) === String(tableIdToEdit));

  if (tableToEdit) {
    if (name_subject) name_subject.value = tableToEdit.name;

    // Переконуємося, що teachers/students є масивами перед .map
    const selectedTeacherIds = Array.isArray(tableToEdit.teachers) ? tableToEdit.teachers.map((t) => String(t.id)) : [];
    const selectedStudentIds = Array.isArray(tableToEdit.students) ? tableToEdit.students.map((s) => String(s.id)) : [];

    currentTableId = tableIdToEdit; // Зберігаємо ID поточної таблиці для редагування

    if (wrapper_shadow) wrapper_shadow.style.display = "block";
    if (addTable) addTable.style.display = "flex"; // Це ваше модальне вікно?
    if (add_table_subject) add_table_subject.style.display = "none";
    if (edit_table_subject) edit_table_subject.style.display = "block";
    if (button_create) button_create.style.display = "none";
    if (button_edit) button_edit.style.display = "block";
    
    loadUsersForEdit(selectedTeacherIds, selectedStudentIds);
  } else {
    console.error("Table with ID " + tableIdToEdit + " not found in the loaded list for editing.");
    alert("Could not find table data to edit.");
  }
}

function editFormSubject() { // Для ОНОВЛЕННЯ існуючої таблиці
  const errorBlockTeachers = document.getElementById("error-teachers");
  const selectedTeachersValues = $(selectTeachers).val();
  let isValid = true;

  if (!selectedTeachersValues || selectedTeachersValues.length === 0) {
    if (errorBlockTeachers) {
        errorBlockTeachers.style.display = "block";
        errorBlockTeachers.textContent = "Please select at least one teacher.";
    }
    isValid = false;
  } else {
    if (errorBlockTeachers) errorBlockTeachers.style.display = "none";
  }

  if (!checkNameSubject(name_subject)) {
    isValid = false;
  }

  if (!isValid) return false;
  if (!currentTableId) {
      alert("Error: No table selected for editing.");
      return false;
  }

  const name = name_subject.value;
  const selectedTeacherIds = $(selectTeachers).val().map((id) => parseInt(id));
  const selectedStudentIds = ($(selectStudents).val() || []).map((id) => parseInt(id));

  updateTable(currentTableId, name, selectedTeacherIds, selectedStudentIds);
  return false; // Для запобігання стандартній відправці форми
}

function updateTable(id, name, teacherIds, studentIds) {
  fetch("/Project/public/api/updateTable.php", {
    method: "POST", // Або PUT
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: parseInt(id), // Переконайтеся, що ID передається як число, якщо сервер очікує число
      name: name,
      teachers: teacherIds,
      students: studentIds,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Table updated successfully!");
        closeAdd();
        location.reload(); // Або оновити список динамічно
      } else {
        alert("Error updating table: " + (data.message || "Unknown error"));
      }
    })
    .catch((error) => {
      console.error("Fetch error (updateTable):", error);
      alert("An error occurred while updating the table.");
    });
}

// expandSelect та collapseSelect, ймовірно, не потрібні для select2
// $(document).ready для select2
$(document).ready(function() {
  if ($.fn.select2) { // Перевірка, чи select2 завантажено
    if(selectTeachers) $('#select-teachers').select2({ placeholder: "Select teachers", allowClear: true, width: "100%"});
    if(selectStudents) $('#select-students').select2({ placeholder: "Select students", allowClear: true, width: "100%"});
  } else {
    console.warn("Select2 is not loaded.");
  }
});