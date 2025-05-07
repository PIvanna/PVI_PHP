<?php
// Підключення необхідних файлів
require_once __DIR__ . '/../../app/controllers/TableController.php';
require_once '../../app/core/Session.php';

$input = json_decode(file_get_contents('php://input'), true);




$controller = new TableController();
$controller->create($input);  // Передача даних в метод контролера
