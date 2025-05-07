<?php
require_once '../../app/models/Tables.php';
require_once __DIR__ . '/../core/Session.php';
require_once '../../app/models/User.php';

class TableController
{
    public function create($data)
    {
        error_log('Data received in controller: ' . print_r($data, true)); // Лог даних, що отримані в контролері

        $name = $data['name'];
        $teachers = $data['teachers'];
        $students = $data['students'];

        if (Tables::exists($name)) {
            error_log("Table '$name' already exists."); // Лог, якщо таблиця існує
            echo json_encode(['success' => false, 'message' => 'Table already exists']);
            return;
        }

        if (Tables::create($name, $teachers, $students)) {
            error_log("Table '$name' created successfully."); // Лог успішного створення
            echo json_encode(['success' => true, 'message' => 'Table created']);
        } else {
            error_log("Error creating table '$name'."); // Лог помилки при створенні
            echo json_encode(['success' => false, 'message' => 'Error creating table']);
        }
    }

    public function getAllTablesWithUsers()
    {
        // Отримуємо всі таблиці з бази даних
        $tables = Tables::getAllTables();

        $allTablesWithUsers = [];

        foreach ($tables as $table) {
            // Декодуємо масиви користувачів (ID)
            $teachersIds = json_decode($table['teachers'], true);
            $studentsIds = json_decode($table['students'], true);

            // Конвертуємо ID в деталі користувачів
            $userDetails = $this->convertUserIdsToDetails($teachersIds, $studentsIds);

            // Створюємо новий масив з усіма даними
            $allTablesWithUsers[] = [
                'id' => $table['id'],
                'name' => $table['name'],
                'teachers' => $userDetails['teachers'],
                'students' => $userDetails['students']
            ];
        }

        // Повертаємо результат як JSON
        echo json_encode([
            'success' => true,
            'data' => $allTablesWithUsers
        ]);
    }

    private function convertUserIdsToDetails($teachersIds, $studentsIds)
    {
        // Отримуємо деталі користувачів за їх ID (припускається, що є метод, який отримує користувачів з бази)
        $teachers = $this->getUsersByIds($teachersIds);
        $students = $this->getUsersByIds($studentsIds);

        return [
            'teachers' => $teachers,
            'students' => $students
        ];
    }

    private function getUsersByIds($ids)
    {
        // Приклад: Отримуємо користувачів за їх ID з бази даних
        $users = [];
        foreach ($ids as $id) {
            $user = User::findById($id);
            if ($user) {
                $users[] = $user;
            }
        }
        return $users;
    }

    public function getTableWithUsers($tableId)
    {
        // Отримуємо таблицю за конкретним ID
        $table = Tables::getTableById($tableId);

        if (!$table) {
            // Якщо таблиця не знайдена, повертаємо помилку
            echo json_encode([
                'success' => false,
                'message' => 'Table not found'
            ]);
            return;
        }

        // Декодуємо масиви користувачів (ID)
        $teachersIds = json_decode($table['teachers'], true);
        $studentsIds = json_decode($table['students'], true);

        // Конвертуємо ID в деталі користувачів
        $userDetails = $this->convertUserIdsToDetails($teachersIds, $studentsIds);

        // Створюємо масив з даними конкретної таблиці
        $tableWithUsers = [
            'id' => $table['id'],
            'name' => $table['name'],
            'teachers' => $userDetails['teachers'],
            'students' => $userDetails['students']
        ];

        // Повертаємо результат як JSON
        echo json_encode([
            'success' => true,
            'data' => $tableWithUsers
        ]);
    }

    public function delete($id)
    {
        if (Tables::delete($id)) {
            echo json_encode(['success' => true, 'message' => 'Table deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to delete table']);
        }
    }

    public function updateTable($id, $name, $teachers, $students)
{
    if (Tables::update($id, $name, $teachers, $students)) {
        echo json_encode(['success' => true, 'message' => 'Table updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update table']);
    }
}

}
