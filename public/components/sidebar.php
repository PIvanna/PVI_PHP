<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Document</title>
  <link rel="stylesheet" href="/Project/public/css/sidebar.css">
</head>

<body>
  <div id="burger-menu" tabindex="0" onclick="burgerMenu()" onfocus="this.style.outline='none'"
    onkeydown="handleBurgerKeyDown(event)">
    <div class="line-burger"></div>
    <div class="line-burger"></div>
    <div class="line-burger"></div>
  </div>

  <aside class="display_flex_c">
    <nav>
      <ul class="nav-list display_flex_c">
        <li>
          <a class="nav-item font-Monomakh" href="./dashboard.php">Dashboard</a>
        </li>
        <li>
          <a class="nav-item font-Monomakh" href="./tasks.php">Tasks</a>
        </li>
        <li>
          <a class="nav-item font-Monomakh" href="./table.php">Table</a>
        </li>
      </ul>
    </nav>
  </aside>
</body>

</html>