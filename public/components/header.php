<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="/Project/public/css/header.css">
</head>

<body>
  <header class="display_flex_r_sb">
    <h1 class="font-Monomakh"><a href="./index.php">CMS</a></h1>
    <div class="wrapper-header display_flex_r_sb">
      <div class="notif">
        <a href="../message.php">
          <img id="bell" tabindex="0" onclick="hideNotif(event)" onkeydown="handleKeyPress(event)"
            alt="Notification bell" src="/Project/public/img/appointment-reminders.png">
          <!-- ondblclick="bell()"> -->

          <!-- />  -->
        </a>
        <div id="sign-not"></div>
        <div id="message-wraper" class="animation display_flex_c">
          <div class="message-elem display_flex_r_sb">
            <div class="message-profile display_flex_c">
              <img src="/Project/public/img/gender-neutral-user.png" alt="" class="message-avatar" />
              <p class="font-Monomakh">John. K.</p>
            </div>
            <div class="message-item"></div>
          </div>
          <div class="message-elem display_flex_r_sb">
            <div class="message-profile display_flex_c">
              <img src="/Project/public/img/gender-neutral-user.png" alt="" class="message-avatar" />
              <p class=" font-Monomakh">John. K.</p>
            </div>
            <div class="message-item"></div>
          </div>
          <div class="message-elem display_flex_r_sb">
            <div class="message-profile display_flex_c">
              <img src="/Project/public/img/gender-neutral-user.png" alt="" class="message-avatar" />
              <p class=" font-Monomakh">John. K.</p>
            </div>
            <div class="message-item"></div>
          </div>
        </div>
      </div>
      <div class="profile display_flex_r_sa">
        <img src="/Project/public/img/gender-neutral-user.png" alt="Foto" class="avatar" />
        <p id="userInit" class="username font-Monomakh">Ivanna Pavlyshyn</p>
        <div id="drop-profile" class="animation">
          <p class="drop-profile-p font-Monomakh"><a href="#">Profile</a></p>
          <p onclick="logoutFrom()" class="drop-profile-p font-Monomakh"><a href="#">Log out</a></p>
        </div>
      </div>


  </header>

</body>
<script src="/Project/public/js/header.js"></script>

</html>