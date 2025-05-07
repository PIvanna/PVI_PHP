<?php
require_once __DIR__ . '/../../app/controllers/TaskController.php';
require_once '../../app/core/Session.php';

$controller = new TaskController();
$controller->getAllTasks();
