<?php

require_once __DIR__ . '/../models/User.php';

class UserController
{
    public function update($data)
    {
        // Викликаємо метод оновлення користувача
        $response = User::update($data);
        
        // Перевірка на наявність помилок у відповіді
        if ($response['success']) {
            // Якщо успішно, повертаємо відповідь
            echo json_encode(['success' => true, 'message' => 'User updated successfully']);
        } else {
            // Якщо є помилки, виводимо їх
            $errors = isset($response['errors']) ? $response['errors'] : [];
            echo json_encode([
                'success' => false, 
                'message' => isset($response['message']) ? $response['message'] : 'Failed to update user',
                'errors' => $errors
            ]);
        }
    }
}
 