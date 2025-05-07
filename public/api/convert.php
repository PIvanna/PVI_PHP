<?php
require_once __DIR__ . '/../../app/controllers/TableController.php';
require_once '../../app/models/Tables.php';
require_once '../../app/core/Session.php';

header('Content-Type: application/json'); // дуже важливо!

$controller = new TableController();
$controller->getAllTablesWithUsers();
