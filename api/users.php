<?php

//http://user-manager.test/api/users.php
//http://user-manager.test/api/users.php?id=1

require_once '../config/database.php';
require_once '../includes/get-users.php';
header('Content-Type: application/json; charset=utf-8');

function validateUserInput($nameFirst, $nameLast, $role, $status)
{
    // Перевіряємо обов'язкові поля
    if ($nameFirst === '' || $nameLast === '' || $role === '') {
        return [
            'code' => 101,
            'message' => 'Required fields are empty'
        ];
    }

    // Перевіряємо допустимість ролі
    if ($role !== 'admin' && $role !== 'user') {
        return [
            'code' => 102,
            'message' => 'Invalid role'
        ];
    }

    // Перевіряємо статус
    if ($status !== 0 && $status !== 1) {
        return [
            'code' => 106,
            'message' => 'Invalid status'
        ];
    }

    return null;
}


if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    if (isset($_GET['id'])) {

        $id = (int) $_GET['id'];

        if ($id <= 0) {

            echo json_encode([
                'status' => false,
                'error' => [
                    'code' => 103,
                    'message' => 'Invalid user ID'
                ]
            ]);

            exit;
        }    

        $stmt = $pdo->prepare(
            "SELECT id, name_first, name_last, status, role
             FROM users
             WHERE id = :id"
        );

        $stmt->execute([
            'id' => $id
        ]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Якщо користувача не знайдено
        if (!$user) {

            echo json_encode([
                'status' => false,
                'error' => [
                    'code' => 100,
                    'message' => 'not found user'
                ]
            ]);
            exit;
        }

        echo json_encode([
            'status' => true,
            'error' => null,
            'user' => $user
        ]);
        exit;
    }

    $users = getAllUsers($pdo);
    
    echo json_encode([
        'status' => true,
        'error' => null,
        'users' => $users
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Обробляємо групову зміну статусу
    if (isset($_POST['action']) && isset($_POST['users'])) {

        $action = $_POST['action'];
        $users = $_POST['users'];

        // Перевіряємо, що список користувачів не порожній
        if (!is_array($users) || count($users) === 0) {

            echo json_encode([
                'status' => false,
                'error' => [
                    'code' => 104,
                    'message' => 'No users selected'
                ]
            ]);
            exit;
        }

        // Перевіряємо допустимість дії
        if (!in_array($action, ['active', 'inactive'])) {

            echo json_encode([
                'status' => false,
                'error' => [
                    'code' => 105,
                    'message' => 'Invalid action'
                ]
            ]);
            exit;
        }

        $notFoundIds = [];

        foreach ($users as $userId) {

            $userId = (int)$userId;

            if ($userId <= 0) {
                continue;
            }

            $status = $action === 'active' ? 1 : 0;

            $stmt = $pdo->prepare(
                "UPDATE users
                SET status = :status
                WHERE id = :id"
            );

            $stmt->execute([
                'status' => $status,
                'id' => $userId
            ]);

            if ($stmt->rowCount() === 0) {

                $stmt = $pdo->prepare(
                    "SELECT id FROM users WHERE id = :id"
                );

                $stmt->execute([
                    'id' => $userId
                ]);

                if (!$stmt->fetch()) {
                    $notFoundIds[] = $userId;
                }
            }
        }

        echo json_encode([
            'status' => true,
            'error' => null,
            'not_found' => $notFoundIds
        ]);
        exit;
    }

    $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
    $nameFirst = trim($_POST['name_first'] ?? '');
    $nameLast = trim($_POST['name_last'] ?? '');
    $status = isset($_POST['status']) ? (int)$_POST['status'] : 0;
    $role = trim($_POST['role'] ?? '');


    $validationError = validateUserInput(
        $nameFirst,
        $nameLast,
        $role,
        $status
    );

    if ($validationError !== null) {

        echo json_encode([
            'status' => false,
            'error' => $validationError
        ]);

        exit;
    }

    if ($id > 0) {

        // Перевіряємо, чи існує користувач
        $stmt = $pdo->prepare(
            "SELECT id FROM users WHERE id = :id"
        );

        $stmt->execute([
            'id' => $id
        ]);

        if (!$stmt->fetch()) {

            echo json_encode([
                'status' => false,
                'error' => [
                    'code' => 100,
                    'message' => 'not found user'
                ]
            ]);

            exit;
        }

        $stmt = $pdo->prepare(
            "UPDATE users
             SET name_first = :name_first,
                 name_last = :name_last,
                 status = :status,
                 role = :role
             WHERE id = :id"
        );

        $stmt->execute([
            'id' => $id,
            'name_first' => $nameFirst,
            'name_last' => $nameLast,
            'status' => $status,
            'role' => $role
        ]);

        echo json_encode([
            'status' => true,
            'error' => null,
            'id' => $id
        ]);
        exit;
    }

    $stmt = $pdo->prepare(
        "INSERT INTO users (name_first, name_last, status, role)
         VALUES (:name_first, :name_last, :status, :role)"
    );

    $stmt->execute([
        'name_first' => $nameFirst,
        'name_last' => $nameLast,
        'status' => $status,
        'role' => $role
    ]);

    echo json_encode([
        'status' => true,
        'error' => null,
        'id' => $pdo->lastInsertId()
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {

    parse_str(file_get_contents("php://input"), $_DELETE);

    $ids = $_DELETE['ids'] ?? [];

    if (!is_array($ids) || count($ids) === 0) {

        echo json_encode([
            'status' => false,
            'error' => [
                'code' => 108,
                'message' => 'No users selected'
            ]
        ]);

        exit;
    }

    foreach ($ids as $id) {

        $id = (int)$id;

        if ($id <= 0) {
            continue;
        }

        $stmt = $pdo->prepare(
            "DELETE FROM users WHERE id = :id"
        );

        $stmt->execute([
            'id' => $id
        ]);
    }

    echo json_encode([
        'status' => true,
        'error' => null
    ]);

    exit;
}

// Повертаємо помилку для невідомого HTTP-методу
echo json_encode([
    'status' => false,
    'error' => [
        'code' => 400,
        'message' => 'Method not allowed'
    ]
]);

exit;