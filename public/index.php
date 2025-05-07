<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="A site to manage and interact with the online student list" />
  <title>Students</title>
  <!-- <link rel="manifest" href="/Project/public/manifest.json"> -->
  <link rel="stylesheet" href="/Project/public/css/main.css" />
  <link rel="stylesheet" href="/Project/public/css/table.css" />
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js"></script>
</head>

<body>
  <div id="header-placeholder"></div>
  <div id="sidebar-placeholder"></div>
  <div class="main-wrapper">
    <main>
      <h2 class="font-Monomakh" id="main-name-table">Students</h2>
      <div class="wrapper-table">
        <div id="but-table-all">
          <button id="button-del-all" class="font-Monomakh main-buttons" onclick="delAll()" type="button">
            <img src="./img/1214428.png" alt="delete" />
          </button>
          <button id="button-add" class="font-Monomakh main-buttons" onclick="openAdd()">
            +
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>
                <input onclick="checkTh()" type="checkbox" id="checkbox1" /><label style="font-size: 0"
                  for="checkbox1">hi</label>
              </th>
              <th>Group</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Birthday</th>
              <th>Status</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody id="main-tbody"></tbody>
        </table>
      </div>
      <div class="pagination">
        <a href="#" class="active"><<</a>
        <a href="#"><</a>
        <a href="#">1</a>
        <a href="#">2</a>
        <a href="#">3</a>
        <a href="#">></a>
        <a href="#">>></a>
      </div>
    </main>
  </div>
  <div id="wrapper-shadow">

    <div id="addStudent">
      <button class="button-close" onclick="closeAdd()">+</button>
      <h3 id="add_text">Add student</h3>
      <h3 id="edit_text">Edit student</h3>
      <div class="line"></div>
      <form id="form-add">
        <fieldset id="fieldset-add">
          <legend style="font-size: 0">hi</legend>
          <div class="form-item">
            <label for="select-teachers">Teachers</label>
            <select name="teachers[]" id="select-teachers" onchange="checkTeachers(this)" multiple="multiple">
            </select>
            <div class="block-error" id="error-teachers">Choose at least one teacher</div>
          </div>

          <div class="form-item">
            <label for="select-students">Students</label>
            <select name="students[]" id="select-students" multiple="multiple">
            </select>
            <div class="block-error">Choose students</div>
          </div>
          <div class="form-item">
            <label for="input-date">Birthday</label>
            <input id="input-date" oninput="checkBirthday()" type="date" />
            <div class="block-error">Enter birthday in format 04/05/2002</div>
          </div>
          <div class="form-item">
            <label for="fname">First name</label>
            <input type="text" id="fname" oninput="checkName(this)" name="fname" />
            <div class="block-error">
              Enter your name two letters min. Only letters
            </div>
          </div>
          <div class="form-item">
            <label for="lname">Last name</label>
            <input type="text" id="lname" oninput="checkSurname(this)" name="lname" />
            <div class="block-error">
              Enter your surname two letters min. Only letters
            </div>
          </div>
          <div class="form-item">
            <label for="select-group">Group</label>
            <select name="group" id="select-group">
              <option value="selected">Select group</option>
              <option value="PZ-21">PZ-21</option>
              <option value="PZ-22">PZ-22</option>
              <option value="PZ-23">PZ-23</option>
              <option value="PZ-24">PZ-24</option>
            </select>
            <div class="block-error">Choose group</div>
          </div>
          <div class="form-item">
            <label for="select-gender">Gender</label>
            <select name="group" id="select-gender">
              <option value="selected">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <div class="block-error">Choose gender</div>
          </div>
        </fieldset>
      </form>
      <div class="line"></div>
      <div class="buttons">
        <button id="button-ok" class="buttons-func-small" onclick="okClick()">
          OK
        </button>
        <button id="button-create" class="buttons-func-small" type="submit" onclick="checkForm(event)">
          Create
        </button>
        <button id="button-save" class="buttons-func-small" type="submit" onclick="saveForm()">
          Save
        </button>
      </div>
    </div>
    <div id="delete-wraper">
      <button class="button-close" onclick="closeDel()">+</button>
      <h3>Warnings</h3>
      <div class="line"></div>
      <p id="war_text" class="font-Monomakh">
        Are you sure you want to delete user Ivanna Pavlyshyn
      </p>
      <div class="line"></div>
      <div class="buttons">
        <button id="button-cancel" class="buttons-func-small" onclick="closeDel()">
          Cancel
        </button>
        <button id="button-ok-del" class="buttons-func-small" type="submit" onclick="delStudent()">
          OK
        </button>
      </div>
    </div>
    <div id="info-student-wraper">
      <button class="button-close" onclick="closeInfo()">+</button>
      <h4 class="font-Monomakh">Information about student</h4>
      <p class="info-student-p" id="group-det"></p>
      <p class="info-student-p" id="username-det"></p>
      <p class="info-student-p" id="gender-det"></p>
      <p class="info-student-p" id="birthday-det"></p>
      <p class="info-student-p" id="status-det"></p>
    </div>
  </div>
  <script>
    $(document).ready(function () {
      $('#select-teachers').select2();
      $('#select-students').select2();
    });
  </script>

  <script src="/Project/public/js/main.js"></script>
  <script src="/Project/public/js/components.js"></script>
  <!-- <script>
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/Project/public/sw.js")
          .then(() => console.log("Service Worker registered"))
          .catch((err) =>
            console.error("Service Worker registration failed", err)
          );
      }
    </script> -->
</body>

</html>