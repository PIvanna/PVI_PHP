<?php
class Session {
  private static function start() {
    if (session_status() === PHP_SESSION_NONE) {
      session_start();
    }
  }

  public static function set($key, $value) {
    self::start(); // Переконуємося, що сесія почалась
    $_SESSION[$key] = $value;
  }

  public static function get($key) {
    self::start(); // Переконуємося, що сесія почалась
    return $_SESSION[$key] ?? null;
  }

  public static function destroy() {
    self::start(); // Переконуємося, що сесія почалась
    session_destroy();
    $_SESSION = []; // Очистити сесію
  }
}

