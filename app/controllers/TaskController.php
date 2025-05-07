<?php
require_once __DIR__ . '/../models/Task.php';
require_once __DIR__ . '/../core/Database.php';

class TaskController
{
    public function create()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            http_response_code(405);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['name'], $data['date'], $data['description'], $data['status'])) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            return;
        }

        $errors = [];

        if (strlen($data['name']) < 3)
            $errors[] = 'Name must be at least 3 characters.';
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['date']))
            $errors[] = 'Invalid date format.';
        if (!in_array($data['status'], ['todo', 'in_process', 'done']))
            $errors[] = 'Invalid status.';

        if (!empty($errors)) {
            echo json_encode(['success' => false, 'errors' => $errors]);
            return;
        }

        $task = Task::create($data['name'], $data['date'], $data['description'], $data['status']);

        echo json_encode(['success' => true, 'task' => $task]);
    }

    public function getAllTasks()
    {
        // Отримуємо всі таблиці з бази даних
        $tables = Task::getAllTasks();

        // Повертаємо результат як JSON
        echo json_encode([
            'success' => true,
            'data' => $tables
        ]);

    }

    public function delete($id)
    {
        if (Task::delete($id)) {
            echo json_encode(['success' => true, 'message' => 'Table deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to delete table']);
        }
    }

    public function update($data)
    {
        $response = Task::update($data);

        if ($response['success']) {
            echo json_encode(['success' => true, 'message' => 'User updated successfully']);
        } else {
            $errors = isset($response['errors']) ? $response['errors'] : [];
            echo json_encode([
                'success' => false,
                'message' => isset($response['message']) ? $response['message'] : 'Failed to update user',
                'errors' => $errors
            ]);
        }
    }

    
}
