<?php
require_once '../../app/controllers/AuthController.php';
require_once '../../app/models/User.php';
require_once '../../app/core/Session.php';

$controller = new AuthController();
$controller->logout();
