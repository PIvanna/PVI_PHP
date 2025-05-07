<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="./css/intro.css">
</head>

<body>
    <h1 class="font-Monomakh ">CMS</h1>
    <div class="buttons-register-wraper">
        <button onclick="showSignInForm()" type="button" class="button-register font-Monomakh">
            Sign In
        </button>
        <button type="buton" onclick="showLoginInForm()" class="button-register font-Monomakh">
            Login In
        </button>
    </div>
    <div id="signInForm">
        <button class="button-close" onclick="returnToMain()">+</button>
        <h3>Sign in</h3>
        <form id="form-signIn">
            <div class="line"></div>

            <fieldset id="fieldset-signIn">
                <legend style="font-size: 0">hi</legend>
                <div class="form-item">
                    <label for="input-email-signIn">Email</label>
                    <input id="input-email-signIn" oninput="checkEmail(this)" type="email" />
                    <div class="block-error">Enter email</div>
                </div>
                <div class="form-item">
                    <label for="input-date-signIn">Birthday</label>
                    <input id="input-date-signIn" oninput="checkBirthday(this)" type="date" />
                    <div class="block-error">Enter birthday in format 04/05/2002</div>
                </div>
                <div class="form-item">
                    <label for="fname_signIn">First name</label>
                    <input type="text" id="fname_signIn" oninput="checkName(this)" name="fname_signIn" />
                    <div class="block-error">
                        Enter your name two letters min. Only letters
                    </div>
                </div>
                <div class="form-item">
                    <label for="lname_signIn">Last name</label>
                    <input type="text" id="lname_signIn" oninput="checkSurname(this)" name="lname_signIn" />
                    <div class="block-error">
                        Enter your surname two letters min. Only letters
                    </div>
                </div>
                <div class="form-item">
                    <label for="select-group-signIn">Group</label>
                    <select name="select-group-signIn" id="select-group-signIn">
                        <option value="selected">Select group</option>
                        <option value="PZ-21">PZ-21</option>
                        <option value="PZ-22">PZ-22</option>
                        <option value="PZ-23">PZ-23</option>
                        <option value="PZ-24">PZ-24</option>
                    </select>
                    <div class="block-error">Choose group</div>
                </div>
                <div class="form-item">
                    <label for="select-gender-signIn">Gender</label>
                    <select name="select-gender-signIn" id="select-gender-signIn">
                        <option value="selected">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                    <div class="block-error">Choose gender</div>
                </div>
                <div class="form-item">
                    <label for="password_signIn">Password</label>
                    <input type="password" id="password_signIn" oninput="checkPassword(this)" name="password_signIn" />
                    <div class="block-error">
                        Enter your surname two letters min. Only letters
                    </div>
                </div>

                <div class="form-item">
                    <label for="passwordRepeat_signIn">Repeat password</label>
                    <input type="password" id="passwordRepeat_signIn" oninput="checkRepeatPassword(this)"
                        name="passwordRepeat_signIn" />
                    <div class="block-error">
                        Enter your surname two letters min. Only letters
                    </div>
                </div>
                <div class="form-item">
                    <label for="passwordRepeat_signIn">Role</label>
                    <label style="display: flex; align-items: center;">
                        <input type="radio" name="role" value="teacher" onchange="roleChanged(this)"> Teacher
                    </label>
                    <label style="display: flex; align-items: center;">
                        <input type="radio" checked name="role" value="student" onchange="roleChanged(this)"> Student
                    </label>
                </div>
            </fieldset>
            <div class="line"></div>
            <div class="buttons">
                <button type="reset" id="button-ok-signIn" class="buttons-func-small">
                    Reset
                </button>
                <button id="button-create-signIn" class="buttons-func-small" type="button" onclick="signInForm(this)">
                    Sign In
                </button>
            </div>
        </form>

    </div>
    <div id="authForm-wraper">
        <button class="button-close" onclick="returnToMain()">+</button>
        <h3 id="add_text">Login</h3>
        <form id="form-auth">
            <fieldset id="fieldset-auth">
                <legend style="font-size: 0">hi</legend>
                <div class="form-item">
                    <label for="input-email-loginIn">Email</label>
                    <input id="input-email-loginIn" oninput="checkEmail(this)" type="email" />
                    <div class="block-error">Enter email</div>
                </div>
                <div class="form-item">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" />
                    <div class="block-error">
                        Enter your name two letters min. Only letters
                    </div>
                </div>

            </fieldset>
            <div class="buttons buttons-auth">
                <button type="reset" id="button-ok" class="buttons-func-small">
                    Reset
                </button>
                <button id="button-create" class="buttons-func-small" type="button" onclick="loginIn()">
                    Login
                </button>
            </div>
        </form>
    </div>
</body>
<script src="/Project/public/js/intro.js"></script>

</html>