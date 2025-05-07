<?php
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/StudentTeacherController.php';
require_once '../../app/models/User.php';
require_once '../../app/core/Session.php';


class Router {
  public static function route($uri) {
    switch ($uri) {
      case '/login':
        (new AuthController)->login();
        break;

      case '/logout':
        (new AuthController)->logout();
        break;

      case '/users': // новий маршрут для студентів та викладачів
        (new StudentTeacherController)->getUsers();
        break;

      default:
        // Якщо маршрут не знайдений, показуємо сторінку або повертаємо 404
        header("HTTP/1.1 404 Not Found");
        echo json_encode(['error' => 'Маршрут не знайдений']);
        break;
    }
  }
}

