<?php
class Task
{
    public static function create($name, $date, $description, $status)
    {
        $db = Database::connect();
        $stmt = $db->prepare("INSERT INTO tasks (name, date, description, status) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $date, $description, $status]);

        $id = $db->lastInsertId();

        return [
            'id' => (int) $id,
            'name' => $name,
            'date' => $date,
            'description' => $description,
            'status' => $status
        ];
    }

    public static function getAllTasks()
    {
        $db = Database::connect();
        $stmt = $db->query("SELECT * FROM tasks");
        return $stmt->fetchAll(PDO::FETCH_ASSOC); // Повертає всі таблиці
    }

    public static function delete($id)
    {
        $db = Database::connect();
        $stmt = $db->prepare("DELETE FROM tasks WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public static function update($data)
    {
        $db = Database::connect();
        $errors = [];

        if (strlen($data['name']) < 3)
            $errors[] = 'Name must be at least 3 characters.';
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['date']))
            $errors[] = 'Invalid date format.';
        if (!in_array($data['status'], ['todo', 'in_process', 'done']))
            $errors[] = 'Invalid status.';

        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors]; // Повертаємо помилки валідації
        }

        $stmt = $db->prepare("
        UPDATE tasks 
        SET 
            `name` = ?, 
            date = ?, 
            description = ?, 
            status = ?
        WHERE id = ?
        ");


        $result = $stmt->execute([
            $data['name'],
            $data['date'],
            $data['description'],
            $data['status'],
            $data['id']
        ]);

        return $result ? ['success' => true, 'message' => 'User updated successfully'] : ['success' => false, 'message' => 'Failed to update user'];
    }

}
