<?php
require_once __DIR__ . '/../../app/controllers/StudentTeacherController.php';
require_once '../../app/core/Session.php';

$controller = new StudentTeacherController();
$controller->getUsers();
