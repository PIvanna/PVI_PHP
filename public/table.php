<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="A site to manage and interact with the online student list" />
    <title>Students</title>
    <link rel="stylesheet" href="/Project/public/css/main.css" />
    <link rel="stylesheet" href="/Project/public/css/subjects.css" />
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css" rel="stylesheet" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js"></script>

</head>

<body>
    <div id="header-placeholder"></div>
    <div id="sidebar-placeholder"></div>
    <div class="main-wrapper">
        <main>
            <h2 class="font-Monomakh">Tables</h2>
            <div class="wrapper-subjects">
                <button type="button" id="create-table" onclick="openCreateTable()"
                    class="font-Monomakh button-subjects">Create
                    table</button>
                <div class="all-tables-subjects">


                </div>
            </div>
        </main>
    </div>
    <div id="wrapper-shadow">
        <div id="addTable">
            <button class="button-close" onclick="closeAdd()">+</button>
            <h3 id="add-table-subject">Add table</h3>
            <h3 id="edit-table-subject">Edit table</h3>
            <form id="addTableForm">
                <div class="line"></div>

                <div class="form-item">
                    <label for="fname">First name</label>
                    <input type="text" name="name_subject" id="name_subject" onchange="checkNameSubject(this)"
                        placeholder="Enter name of subject" required />
                    <div class="block-error">Choose teachers</div>
                </div>
                <div class="form-item">
                    <label for="select-teachers">Teachers</label>
                    <select name="teachers[]" id="select-teachers" onchange="checkTeachers(this)" multiple="multiple"
                        onfocus="expandSelect(this)" onblur="collapseSelect(this)">
                    </select>
                    <div class="block-error" id="error-teachers">Choose at least one teacher</div>
                </div>

                <div class="form-item">
                    <label for="select-students">Students</label>
                    <select name="students[]" id="select-students" multiple="multiple" onfocus="expandSelect(this)"
                        onblur="collapseSelect(this)">
                    </select>
                    <div class="block-error">Choose students</div>
                </div>

                <div class="line"></div>
                <div class="buttons">
                    <button id="button-reset-subjects" type="reset" onclick="resetFormTable()"
                        class="buttons-func-small">
                        Reset
                    </button>
                    <button id="button-create" class="buttons-func-small" type="button"
                        onclick="checkFormSubject(event)">
                        Create
                    </button>
                    <button id="button-edit" class="buttons-func-small" type="button" onclick="editFormSubject(event)">
                        Edit
                    </button>
                </div>
            </form>
        </div>
    </div>
</body>
<script src="/Project/public/js/components.js"></script>

<script src="/Project/public/js/table.js"></script>

</html>