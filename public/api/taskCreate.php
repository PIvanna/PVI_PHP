<?php
require_once __DIR__ . '/../../app/controllers/TaskController.php';
require_once '../../app/models/Task.php';
require_once '../../app/core/Session.php';

header('Content-Type: application/json'); // дуже важливо!

$controller = new TaskController();
$controller->create();
