<?php

function getAllUsers($pdo)
{
    $stmt = $pdo->query(
        "SELECT id, name_first, name_last, status, role
         FROM users"
    );

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}