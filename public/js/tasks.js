const getElement = document.querySelector.bind(document);
const wrapper_shadow = getElement("#wrapper-shadow");
const addTask = getElement("#addTask");
const infoTask = getElement("#info-tasks-wrapper");
const add_text = getElement("#add_text");
const edit_text = getElement("#edit_text");
const button_create = getElement("#button-create");
const button_save = getElement("#button-save");
const addTaskOne = getElement("#addTaskOne");
const selectTeachers = getElement("#select-teachers");

class Task {
  constructor(name, date, description, status, id) {
    this.name = name;
    this.date = date;
    this.description = description;
    this.status = status;
    this.id = id;
  }
}

let tasks = [];
let currentId = null;
let currentStatus = null;
function loadTasks() {
  fetch("/Project/public/api/getTasks.php", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log(data.data);
        tasks = data.data;
        ["todo", "in_process", "done"].forEach((status) => {
          const statusTasks = tasks.filter((task) => task.status === status);
          renderTasksByStatus(statusTasks, status);
        });
      } else {
        console.error("Помилка при завантаженні даних");
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  loadTasks();
});

function addTaskToDo() {
  wrapper_shadow.style.display = "flex";
  addTask.style.display = "flex";
  add_text.style.display = "block";
  edit_text.style.display = "none";
  button_save.style.display = "none";
  button_create.style.display = "block";
}

function closeModal() {
  wrapper_shadow.style.display = "none";
  addTask.style.display = "none";
  currentId = 0;
}

function checkNameTask(elem) {
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

function checkTermin(elem) {
  let date = elem.value;
  let block = elem.nextElementSibling;

  let datePattern =
    /^(19[1-9]\d|20[0-2]\d|2025)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

  // Перевірка формату дати
  if (!datePattern.test(date)) {
    block.style.display = "block";
    block.textContent = "Invalid date format. Use YYYY-MM-DD.";
    return false;
  }

  let selectedDate = new Date(date);
  let today = new Date();

  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    block.style.display = "block";
    block.textContent = "Enter today’s date or a future date.";
    return false;
  }

  let [year, month, day] = date.split("-").map(Number);
  let daysInMonth = new Date(year, month, 0).getDate();

  if (day > daysInMonth) {
    block.style.display = "block";
    block.textContent = `Enter the day from [01; ${daysInMonth}]`;
    return false;
  }

  block.style.display = "none";
  return true;
}

function checkFormTask(elem) {
  if (
    checkNameTask(getElement("#name_task")) &&
    checkTermin(getElement("#input-date-task"))
  ) {
    fetch("/Project/public/api/taskCreate.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: getElement("#name_task").value,
        date: getElement("#input-date-task").value,
        description: getElement("#description_task").value,
        status: "todo",
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
}

function renderTasksByStatus(tasks, status) {
  const statusToColumnIndex = {
    todo: 0,
    in_process: 1,
    done: 2,
  };

  const columnIndex = statusToColumnIndex[status];
  if (columnIndex === undefined) {
    console.error("Invalid status:", status);
    return;
  }

  const columns = document.querySelectorAll(".columns .column");
  const targetColumn = columns[columnIndex];

  const oldTasks = targetColumn.querySelectorAll(".task");
  oldTasks.forEach((el) => el.remove());

  const addButton = targetColumn.querySelector(".add-task");

  tasks
    .filter((task) => task.status === status)
    .forEach((task) => {
      const taskDiv = document.createElement("div");
      taskDiv.classList.add("task");

      if (status === "todo") {
        taskDiv.classList.add("blue");
      }

      let shortName =
        task.name.length > 10 ? task.name.slice(0, 10) + "..." : task.name;

      taskDiv.textContent = shortName;

      const dateSpan = document.createElement("span");
      dateSpan.textContent = formatDate(task.date);
      taskDiv.appendChild(dateSpan);

      taskDiv.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        showContextMenu(event.pageX, event.pageY, task.id);
      });

      taskDiv.addEventListener("click", () => {
        openInfoTask(task.id, task.name, task.date, task.description, status);
      });

      targetColumn.insertBefore(taskDiv, addButton);
    });
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}.${month}`;
}

function closeInfo() {
  wrapper_shadow.style.display = "none";
  infoTask.style.display = "none";
}

function openInfoTask(id, name, date, description, status) {
  wrapper_shadow.style.display = "flex";
  infoTask.style.display = "flex";

  const elements = {
    date_task: getElement("#date-task"),
    name_task: getElement("#name-task"),
    description_task: getElement("#description-task"),
    status_task: getElement("#status-task"),
  };

  elements.date_task.innerHTML = `<span class="info-cap">Date: </span>${date}`;
  elements.name_task.innerHTML = name;
  elements.description_task.innerHTML = `<span class="info-cap"></span>${description}`;
  elements.status_task.innerHTML = `<span class="info-cap">Status: </span>${status}`;
}

function showContextMenu(x, y, taskId) {
  // Видалити попереднє меню, якщо є
  const existingMenu = document.getElementById("context-menu");
  if (existingMenu) {
    existingMenu.remove();
  }

  const menu = document.createElement("div");
  menu.id = "context-menu";
  Object.assign(menu.style, {
    position: "absolute",
    top: y + "px",
    left: x + "px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "8px 0",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
    zIndex: 1000,
    minWidth: "150px",
    fontFamily: "'Segoe UI', sans-serif",
  });

  const createItem = (text, onClick) => {
    const item = document.createElement("div");
    item.textContent = text;
    Object.assign(item.style, {
      padding: "10px 16px",
      cursor: "pointer",
      transition: "background 0.2s ease",
      fontSize: "14px",
      color: "#333",
    });

    item.addEventListener("mouseenter", () => {
      item.style.backgroundColor = "#f2f2f2";
    });
    item.addEventListener("mouseleave", () => {
      item.style.backgroundColor = "transparent";
    });
    item.addEventListener("click", () => {
      onClick();
      menu.remove();
    });

    return item;
  };

  menu.appendChild(createItem("✏️ Редагувати", () => editTask(taskId)));
  menu.appendChild(createItem("🗑️ Видалити", () => deleteTask(taskId)));

  document.body.appendChild(menu);

  document.addEventListener("click", () => menu.remove(), { once: true });
}

function editTask(id) {
  wrapper_shadow.style.display = "flex";
  addTask.style.display = "flex";
  add_text.style.display = "none";
  edit_text.style.display = "block";
  button_save.style.display = "block";
  button_create.style.display = "none";
  currentId = id;
  console.log(id);
  const foundTask = tasks.find((task) => task.id === id);

  if (foundTask) {
    getElement("#name_task").value = foundTask.name;
    getElement("#input-date-task").value = foundTask.date;
    getElement("#description_task").value = foundTask.description;
  } else {
    console.error("Task not found:", id);
  }
}

function deleteTask(id) {
  console.log("Видалити задачу з id:", id);
  fetch("/Project/public/api/deleteTask.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: parseInt(id) }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Table deleted successfully");
        location.reload();
      } else {
        alert("Error deleting table: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function saveEditTask() {
  const foundTask = tasks.find((task) => task.id === currentId);

  if (foundTask) {
    foundTask.name = getElement("#name_task").value;
    foundTask.date = getElement("#input-date-task").value;
    foundTask.description = getElement("#description_task").value;
  } else {
    console.error("Task not found:", currentId);
  }

  fetch("/Project/public/api/editTask.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: currentId,
      name: foundTask.name,
      date: foundTask.date,
      description: foundTask.description,
      status: foundTask.status,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Table edited successfully");
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

function openModalAddOne(elem, status) {
  wrapper_shadow.style.display = "flex";
  addTaskOne.style.display = "flex";
  currentStatus = status;
  tasks.forEach((task) => {
    console.log(task);
    if (task.status !== status) {
      const option = document.createElement("option");
      option.value = task.id;
      option.textContent = task.name;
      selectTeachers.appendChild(option);
    }
  });

  $(selectTeachers)
    .select2({
      placeholder: "Select teachers",
      allowClear: true,
      width: "100%",
    })
    .trigger("change");
}

function expandSelect(select) {
  console.log("gi");
  select.size = 1; // показати 5 рядків наприклад
}

function collapseSelect(select) {
  select.size = 1; // повернути назад в компактний режим
}

$(document).ready(function () {
  $("#select-teachers").select2();
  $("#select-students").select2();

  // Коли відкрито селект
  $("#select-teachers").on("select2:open", function () {
    $(".select2-container").addClass("expanded");
    $(".select2-selection__rendered").addClass("expanded");
  });

  // Коли закрито селект
  $("#select-teachers").on("select2:close", function () {
    $(".select2-container").removeClass("expanded");
    $(".select2-selection__rendered").removeClass("expanded");
  });

  $("#select-students").on("select2:open", function () {
    $(".select2-container").addClass("expanded");
    $(".select2-selection__rendered").addClass("expanded");
  });

  $("#select-students").on("select2:close", function () {
    $(".select2-container").removeClass("expanded");
    $(".select2-selection__rendered").removeClass("expanded");
  });
});

function resetTasks() {
  selectTeachers.innerHTML = "";
}

function addTaskOneStatus() {
  const selectedTeacherIds = $(selectTeachers)
    .val()
    .map((id) => parseInt(id));

    selectedTeacherIds.forEach((currentId) => {
    const foundTask = tasks.find((task) => task.id === currentId);

    if (foundTask) {
      foundTask.status = currentStatus;

      fetch("/Project/public/api/editTask.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentId,
          name: foundTask.name,
          date: foundTask.date,
          description: foundTask.description,
          status: foundTask.status,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            console.log(`Task ID ${currentId} updated successfully`);
            location.reload();
          } else {
            console.error(`Error updating task ID ${currentId}:`, data.message);
          }
        })
        .catch((error) => {
          console.error(`Fetch error for task ID ${currentId}:`, error);
        });
    } else {
      console.warn(`Task with ID ${currentId} not found`);
    }
  });
}
