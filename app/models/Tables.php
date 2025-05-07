<?php
require_once '../../app/core/Database.php';

class Tables
{

    public static function getAllTables()
    {
        $db = Database::connect();
        $stmt = $db->query("SELECT * FROM tables");
        return $stmt->fetchAll(PDO::FETCH_ASSOC); // Повертає всі таблиці
    }

    public static function exists($name)
    {
        $db = Database::connect();
        $stmt = $db->prepare("SELECT COUNT(*) FROM tables WHERE name = ?");
        $stmt->execute([$name]);
        return $stmt->fetchColumn() > 0;
    }



    public static function create($name, $teachers, $students)
    {
        $db = Database::connect();
        $stmt = $db->prepare("INSERT INTO tables (name, teachers, students) VALUES (?, ?, ?)");
        return $stmt->execute([
            $name,
            json_encode($teachers),
            json_encode($students)
        ]);
    }

    // Метод для отримання користувачів по ID
    public static function getUsersByIds($teacherIds, $studentIds)
    {
        $db = Database::connect();

        // Отримуємо користувачів за ID
        $stmt = $db->prepare("
        SELECT * FROM users WHERE id IN (" . implode(',', array_merge($teacherIds, $studentIds)) . ")");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Метод для отримання всіх користувачів, пов'язаних з таблицею
    public static function getUsersForTable($tableName)
    {
        $db = Database::connect();

        // Отримуємо таблицю за її ім'ям
        $stmt = $db->prepare("SELECT teachers, students FROM tables WHERE name = ?");
        $stmt->execute([$tableName]);
        $table = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$table) {
            return []; // Якщо таблиця не знайдена, повертаємо порожній масив
        }

        // Розкодовуємо масиви з JSON
        $teachers = json_decode($table['teachers'], true);
        $students = json_decode($table['students'], true);

        // Отримуємо всіх користувачів за ID вчителів і студентів
        $users = self::getUsersByIds($teachers, $students);

        return $users;
    }

    public static function getTableById($id)
    {
        $db = Database::connect();
        $stmt = $db->prepare("SELECT * FROM tables WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(); // Повертає одну таблицю
    }

    public static function delete($id)
    {
        $db = Database::connect();
        $stmt = $db->prepare("DELETE FROM tables WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public static function update($id, $name, $teachers, $students)
    {
        $db = Database::connect();
        $stmt = $db->prepare("UPDATE tables SET name = ?, teachers = ?, students = ? WHERE id = ?");
        return $stmt->execute([
            $name,
            json_encode($teachers), // Зберігаємо масив ID як JSON рядок
            json_encode($students), // Зберігаємо масив ID як JSON рядок
            $id
        ]);
    }

}