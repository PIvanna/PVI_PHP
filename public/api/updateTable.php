<?php
require_once __DIR__ . '/../../app/controllers/TableController.php';
require_once __DIR__ . '/../../app/core/Session.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);

if (isset($input['id']) && isset($input['name']) && isset($input['teachers']) && isset($input['students'])) {
    $controller = new TableController();
    $controller->updateTable($input['id'], $input['name'], $input['teachers'], $input['students']);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
}
