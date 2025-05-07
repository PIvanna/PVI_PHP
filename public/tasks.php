<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="A site to manage and interact with the online student list">
  <title>Tasks</title>
  <link rel="stylesheet" href="./css/main.css" />

  <link rel="stylesheet" href="./css/tasks.css" />
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js"></script>
</head>

<body>
  <div id="header-placeholder"></div>
  <div id="sidebar-placeholder"></div>

  <div class="main-wrapper">
    <main>
      <h2>Tasks</h2>
      <div class="columns">
        <!-- ToDo Column -->
        <div class="column">
          <div class="column-header">ToDo</div>
          <div class="task blue">Task #2<span>20.03</span></div>
          <div class="task blue">Task #3<span>30.03</span></div>
          <div class="task blue">Task #4<span>15.04</span></div>
          <div class="task blue">Com...<span>15.04</span></div>
          <button class="add-task" type="button" onclick="addTaskToDo()">+ Add task</button>
        </div>

        <!-- In Process Column -->
        <div class="column">
          <div class="column-header">In process</div>
          <div class="task">Task #1<span>10.03</span></div>
          <button class="add-task" onclick="openModalAddOne(this, 'in_process')">+ Add task</button>
        </div>

        <!-- Done Column -->
        <div class="column">
          <div class="column-header">Done</div>
          <div class="task">Beginnin...<span>10.03</span></div>
          <button class="add-task" onclick="openModalAddOne(this, 'done')">+ Add task</button>
        </div>
      </div>
    </main>
  </div>
  <div id="wrapper-shadow">
    <div id="addTask">
      <button class="button-close" onclick="closeModal()">+</button>
      <h3 id="add_text">Add task</h3>
      <h3 id="edit_text">Edit task</h3>
      <form id="form-task">
        <fieldset id="fieldset-task">
          <div class="line"></div>
          <div class="form-item">
            <label for="input-date-task">Birthday</label>
            <input id="input-date-task" oninput="checkTermin(this)" type="date" />
            <div class="block-error">Enter birthday in format 04/05/2002</div>
          </div>
          <div class="form-item">
            <label for="name_task">Name task</label>
            <input type="text" id="name_task" oninput="checkNameTask(this)" name="fname" />
            <div class="block-error" id="error-teachers">Choose at least one teacher</div>
          </div>
          <div class="form-item">
            <label for="description_task">Description task</label>
            <textarea type="text" id="description_task" name="fname"></textarea>
          </div>
          <div class="line"></div>
        </fieldset>
      </form>
      <div class="buttons">
        <button id="button-ok" type="reset" class="buttons-func-small">
          Reset
        </button>
        <button id="button-create" class="buttons-func-small" type="submit" onclick="checkFormTask(event)">
          Create
        </button>
        <button id="button-save" class="buttons-func-small" type="submit" onclick="saveEditTask()">
          Save
        </button>
      </div>
    </div>
    <div id="info-tasks-wrapper">
      <button class="button-close" onclick="closeInfo()">+</button>
      <div class="task-header">
        <h4 class="font-Monomakh" id="name-task"></h4>
        <span id="date-task" class="task-date"></span>
      </div>
      <div class="task-content">
        <p class="info-student-p" id="description-task"></p>
      </div>
      <div class="task-footer">
        <p class="info-student-p" id="status-task"></p>
      </div>
    </div>
    <div id="addTaskOne">
      <button class="button-close" onclick="closeModal()">+</button>
      <h3 id="add_text">Add task</h3>
      <div class="line"></div>
      <div class="form-item">
        <label for="select-teachers">Tasks</label>
        <select name="teachers[]" id="select-teachers" multiple="multiple" onfocus="expandSelect(this)"
          onblur="collapseSelect(this)">
        </select>
        <div class="block-error" id="error-teachers">Choose at least one teacher</div>
      </div>
      <div class="line" style="margin-top: 20px"></div>
      <div class="buttons">
        <button id="button-ok" type="reset" class="buttons-func-small" onclick="resetTasks()">
          Reset
        </button>
        <button id="button-create" class="buttons-func-small" type="submit" onclick="addTaskOneStatus(event)">
          Add
        </button>
      </div>
    </div>
    <script src="./js/tasks.js"></script>
    <script src="./js/components.js"></script>
</body>

</html>