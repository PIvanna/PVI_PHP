<?php
require_once '../../app/core/Session.php';
require_once '../../app/controllers/RegisterController.php';

$controller = new RegisterController();
$controller->register();
