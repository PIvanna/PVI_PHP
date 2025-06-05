<?php
// Тут може бути будь-яка PHP логіка, наприклад, отримання ID поточного користувача
session_start(); // Якщо ви використовуєте сесії
$current_php_user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'guest';
$current_php_username = isset($_SESSION['username']) ? $_SESSION['username'] : 'Гість';

// --- ЗМІНА ТУТ ---
// Правильний шлях до HTML чату відносно КОРЕНЯ ВЕБ-СЕРВЕРА (htdocs)
// Якщо ваша структура C:\xampp\htdocs\Project\public\chat_client\index.html
$chat_client_url = "./index.html";
// --- КІНЕЦЬ ЗМІНИ ---

// Приклад передачі параметрів, які потім можна зчитати в JS чату:
// $chat_client_url .= "?php_user_id=" . urlencode($current_php_user_id) . "&php_username=" . urlencode($current_php_username);

?>
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <title>Мої Повідомлення</title>
    <style>
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        #chatFrame { width: 100%; height: 100%; border: none; }
    </style>
</head>
<body>
    
    <iframe id="chatFrame" src="<?php echo htmlspecialchars($chat_client_url); ?>"></iframe>

    <script>
    </script>
</body>
</html>