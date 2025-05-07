<?php
require_once __DIR__ . '/../../app/controllers/TaskController.php';
require_once '../../app/core/Session.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);

if (isset($input['id'])) {
    $controller = new TaskController();
    $controller->delete($input['id']);
} else {
    echo json_encode(['success' => false, 'message' => 'ID is required']);
}
