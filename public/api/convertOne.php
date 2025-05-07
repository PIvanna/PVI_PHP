<?php
require_once __DIR__ . '/../../app/controllers/TableController.php';
require_once '../../app/models/Tables.php';
require_once '../../app/core/Session.php';

header('Content-Type: application/json'); // Дуже важливо!

// Перевірка, чи є параметр table_id в запиті
if (isset($_GET['table_id'])) {
    $tableId = $_GET['table_id']; // Отримуємо table_id з запиту
    $controller = new TableController();
    $controller->getTableWithUsers(tableId: $tableId); // Передаємо table_id у метод
} else {
    echo json_encode(['success' => false, 'message' => 'Table ID is required']);
}
