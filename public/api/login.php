<?php
require_once '../../app/controllers/AuthController.php';
require_once '../../app/models/User.php';
require_once '../../app/core/Session.php';

header('Content-Type: application/json'); // дуже важливо!

$controller = new AuthController();
$controller->login();
