<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../core/Session.php';


class StudentTeacherController
{
    public function getUsers()
    {
        header('Content-Type: application/json');

        $data = User::getStudentsAndTeachers(); 
        echo json_encode([
            'success' => true,
            'students' => $data['students'],
            'teachers' => $data['teachers']
        ]);
        exit;
    }

}
