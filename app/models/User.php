<?php
require_once __DIR__ . '/../core/Database.php';
class User
{
  public static function findByUsername($email)
  {
    $db = Database::connect();
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($userData) {
      $user = new self();
      foreach ($userData as $key => $value) {
        $user->$key = $value;
      }
      return $user;
    }
    return null;
  }


  public static function create($name, $surname, $birthday, $group, $gender, $password, $role, $email)
  {
    $db = Database::connect();
    $stmt = $db->prepare("INSERT INTO users (name, surname, birthday, `group`, gender, password, role, email)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $result = $stmt->execute([$name, $surname, $birthday, $group, $gender, $password, $role, $email]);

    if ($result) {
      return $db->lastInsertId();
    }
    return false;
  }


  public static function existsExactUser($name, $surname, $group, $gender, $birthday, $email)
  {
    $db = Database::connect();
    $stmt = $db->prepare("SELECT * FROM users WHERE name = ? AND surname = ? AND `group` = ? AND gender = ? AND birthday = ? AND email = ?");
    $stmt->execute([$name, $surname, $group, $gender, $birthday, $email]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  public static function findById($id)
  {
    $db = Database::connect();
    $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    return $user ? $user : null;
  }

  public static function validateRegistrationData($data)
  {
    $errors = [];

    if (!preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $data['email'] ?? '')) {
      $errors[] = 'Некоректний email.';
    }

    // Перевірка імені
    if (!preg_match('/^[A-Z]{1}[a-z-]{2,20}(\s*[A-Z]{1}[a-z-]{2,20})?$/', $data['name'] ?? '')) {
      $errors[] = 'Некоректне ім’я. Має починатися з великої літери та містити щонайменше 3 літери.';
    }

    // Перевірка прізвища
    if (!preg_match('/^[A-Z]{1}[a-z-]{2,20}(\s*[A-Z]{1}[a-z-]{2,20})?$/', $data['surname'] ?? '')) {
      $errors[] = 'Некоректне прізвище.';
    }

    // Перевірка дати народження
    $birthday = $data['birthday'] ?? '';
    $currentYear = (int) date('Y');

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $birthday)) {
      $errors[] = 'Невірний формат дати народження.';
    } else {
      $year = (int) explode('-', $birthday)[0];
      $minYear = $currentYear - 80;
      $maxYear = $currentYear - 16;

      if ($year < $minYear || $year > $maxYear) {
        $errors[] = "Рік народження має бути в межах [{$minYear}; {$maxYear}].";
      }
    }


    // Перевірка групи
    if (!isset($data['group']) || !preg_match('/^PZ-[0-9]{2,5}$/', $data['group'])) {
      $errors[] = 'Некоректна група.';
    }

    // Перевірка статі
    if (!in_array($data['gender'] ?? '', ['male', 'female'], true)) {
      $errors[] = 'Некоректна стать.';
    }

    // Перевірка пароля
    $password = $data['password'] ?? '';
    if (!preg_match('/^[A-Za-z0-9_]{8,}$/', $password)) {
      $errors[] = 'Пароль повинен містити щонайменше 8 символів та включати тільки англійські літери, цифри або _.';
    }

    // Повтор пароля (опціонально)
    if (isset($data['repeat_password']) && $password !== $data['repeat_password']) {
      $errors[] = 'Паролі не співпадають.';
    }

    // Роль
    if (!in_array($data['role'] ?? '', ['student', 'admin', "teacher"], true)) {
      $errors[] = 'Невірна роль.';
    }

    return $errors;
  }

  public static function getStudentsAndTeachers()
  {
    $db = Database::connect();
    $stmt = $db->prepare("SELECT * FROM users WHERE role IN ('student', 'teacher')");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $students = [];
    $teachers = [];

    foreach ($users as $user) {
      if ($user['role'] === 'student') {
        $students[] = $user;
      } elseif ($user['role'] === 'teacher') {
        $teachers[] = $user;
      }
    }

    return [
      'students' => $students,
      'teachers' => $teachers
    ];
  }

  public static function update($data)
  {
    $db = Database::connect();
    $errors = [];

    // Перевірка імені
    if (!preg_match('/^[A-Z]{1}[a-z-]{2,20}(\s*[A-Z]{1}[a-z-]{2,20})?$/', $data['name'] ?? '')) {
      $errors[] = 'Некоректне ім’я. Має починатися з великої літери та містити щонайменше 3 літери.';
    }

    // Перевірка прізвища
    if (!preg_match('/^[A-Z]{1}[a-z]{2,20}(\s*[A-Z]{1}[a-z]{2,20})?$/', $data['surname'] ?? '')) {
      $errors[] = 'Некоректне прізвище.';
    }

    // Перевірка дати народження
    $birthday = $data['birthday'] ?? '';
    $currentYear = (int) date('Y');

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $birthday)) {
      $errors[] = 'Невірний формат дати народження.';
    } else {
      $year = (int) explode('-', $birthday)[0];
      $minYear = $currentYear - 80;
      $maxYear = $currentYear - 16;

      if ($year < $minYear || $year > $maxYear) {
        $errors[] = "Рік народження має бути в межах [{$minYear}; {$maxYear}].";
      }
    }

    // Перевірка групи
    if (!isset($data['group']) || !preg_match('/^PZ-[0-9]{2,5}$/', $data['group'])) {
      $errors[] = 'Некоректна група.';
    }

    // Перевірка статі
    if (!in_array($data['gender'] ?? '', ['male', 'female'], true)) {
      $errors[] = 'Некоректна стать.';
    }

    // Якщо є помилки валідації, повертаємо їх
    if (!empty($errors)) {
      return ['success' => false, 'errors' => $errors]; // Повертаємо помилки валідації
    }

    // Якщо помилок немає, оновлюємо дані користувача
    $stmt = $db->prepare("
        UPDATE users 
        SET 
            `group` = ?, 
            name = ?, 
            surname = ?, 
            gender = ?, 
            birthday = ?, 
            is_logged_in = ?, 
            role = ?, 
            password = ?,
            email = ?
        WHERE id = ?
    ");

    $result = $stmt->execute([
      $data['group'],
      $data['name'],
      $data['surname'],
      $data['gender'],
      $data['birthday'],
      $data['is_logged_in'],
      $data['role'],
      $data['password'],
      $data['email'],
      $data['id']
    ]);

    return $result ? ['success' => true, 'message' => 'User updated successfully'] : ['success' => false, 'message' => 'Failed to update user'];
  }



  public static function emailExists($email)
  {
    $db = Database::connect();
    $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $count = $stmt->fetchColumn();
    return $count > 0;  // Повертає true, якщо email вже існує
  }

}
