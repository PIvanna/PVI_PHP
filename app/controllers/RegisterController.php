<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../core/Session.php';

class RegisterController
{
  public function register()
  {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
      header('Content-Type: application/json');
      ini_set('display_errors', 1);
      ini_set('display_startup_errors', 1);
      error_reporting(E_ALL);

      // Дебаг: виводимо всі отримані дані
      error_log("Received POST data: " . print_r($_POST, true));

      $name = $_POST['name'];
      $surname = $_POST['surname'];
      $birthday = $_POST['birthday'];
      $group = $_POST['group'];
      $gender = $_POST['gender'];
      $password = $_POST['password'];
      $role = $_POST['role'];
      $email = $_POST['email'];

      // Дебаг: перевірка чи є всі потрібні поля
      if (empty($name) || empty($surname) || empty($birthday) || empty($group) || empty($gender) || empty($password) || empty($role) || empty($email)) {
        error_log('One or more required fields are missing.');
        echo json_encode(['success' => false, 'message' => 'Будь ласка, заповніть всі поля!']);
        exit;
      }

      // Перевірка, чи існує користувач з таким email
      if (User::emailExists($email)) {
        error_log("Email already exists: $email");
        echo json_encode(['success' => false, 'message' => 'Користувач з таким email вже існує']);
        exit;
      }

      // Валідація даних
      $errors = User::validateRegistrationData($_POST);
      if (!empty($errors)) {
        error_log('Validation errors: ' . print_r($errors, true));
        echo json_encode(['success' => false, 'errors' => $errors]);
        exit;
      }

      // Хешування пароля
      $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
      error_log("Password hashed successfully");

      // Створення користувача
      $newUserId = User::create($name, $surname, $birthday, $group, $gender, $hashedPassword, $role, $email);

      if ($newUserId) {
        error_log("New user created with ID: $newUserId");

        // Оновлення користувача в базі
        $db = Database::connect();
        $stmt = $db->prepare("UPDATE users SET is_logged_in = 1 WHERE id = ?");
        $stmt->execute([$newUserId]);

        // Отримання користувача
        $user = User::findById($newUserId);
        Session::set('user', $user);

        echo json_encode([
          'success' => true,
          'message' => 'Користувача зареєстровано',
          'id' => $newUserId,
          'user' => $user
        ]);
      } else {
        error_log("User creation failed.");
        echo json_encode(['success' => false, 'message' => 'Помилка реєстрації']);
      }
    }
  }

}
?>