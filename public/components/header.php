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
    <h1 class="font-Monomakh"><a href="./table.php">CMS</a></h1>
    <div class="wrapper-header display_flex_r_sb">
      <div class="notif">
        <a href="./message.php"> <!-- Посилання на message.php краще прибрати, якщо перехід через JS -->
          <img id="bell" tabindex="0" alt="Notification bell" src="/Project/public/img/appointment-reminders.png">
          <!-- onclick та onkeydown краще прибрати звідси і повісити в JS на bellIconElement -->
        </a>
        <div id="sign-not"></div>
        <!-- РОБИМО ЦЕЙ БЛОК ПОРОЖНІМ -->
        <div id="message-wraper" class="animation display_flex_c">
          <!-- Тут більше немає статичних .message-elem -->
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
    </div>
  </header>
</body>
<script src="/Project/public/js/header.js"></script>

</html>