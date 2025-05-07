<?php
require_once __DIR__ . '/../../app/controllers/UserController.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);

if (isset($input['id'])) {
    $controller = new UserController();
    $controller->update($input);
} else {
    echo json_encode(['success' => false, 'message' => 'ID is required']);
}
