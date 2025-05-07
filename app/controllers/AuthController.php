<?php
class AuthController
{
  public function login()
  {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
      if (!isset($_POST['email'], $_POST['password'])) {
        echo json_encode(value: ['success' => false, 'message' => 'Невірні дані']);
        exit;
      }

      $email = $_POST['email'];
      $password = $_POST['password'];
      $errors = [];

      // Перевірка імені
      if (!preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $email)) {
        $errors[] = 'Некоректне ім’я. Має починатися з великої літери та містити щонайменше 3 символи.';
      }

      // Перевірка пароля
      if (!preg_match('/^[A-Za-z0-9_]{8,}$/', $password)) {
        $errors[] = 'Пароль повинен містити щонайменше 8 символів і тільки англійські літери, цифри та _.';
      }

      if (!empty($errors)) {
        echo json_encode(['success' => false, 'errors' => $errors]);
        exit;
      }

      $user = User::findByUsername($email);

      if ($user && password_verify($password, $user->password)) {
        Session::set('user', $user);

        $db = Database::connect();
        $stmt = $db->prepare("UPDATE users SET is_logged_in = 1 WHERE id = ?");
        $stmt->execute([$user->id]);

        echo json_encode(['success' => true, 'user' => $user]);
        exit;
      } else {
        echo json_encode(['success' => false, 'message' => 'Невірні дані']);
        exit;
      }
    } 

  }

  public function logout()
  {
    session_start();

    $user = Session::get('user');

    if ($user) {
      var_dump($user);

      $db = Database::connect();
      $stmt = $db->prepare("UPDATE users SET is_logged_in = 0 WHERE id = ?");
      $stmt->execute([$user->id]);

    } else {
      echo "Користувача не знайдено у сесії.";
    }

    Session::destroy();
    header('Location: /Project/public/intro.php');
    exit;
  }
}
