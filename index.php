<?php

require_once 'config/database.php';
require_once 'includes/get-users.php';

$users = getAllUsers($pdo);

/**
 * Робимо імітацію системи керування користувачами у дуже скороченому вигляді.	
 * Усі дії мають бути без перезавантаження сторінки. Все через Ajax	
 * (Bootstrap, jQuery, Ajax, PHP).	

 * Всі елементи треба брати з сайту Bootstrap (там звичайний копіпаст)	
 * Oбов'язково дотримуватись структури!	

 * 1. В нас має бути одна сторінка	
 * 2. Виводимо таблицю з користувачами (деталі нижче)	
 * 3. Виводимо над та під таблицею блок з наступними елементами:	
 *     a. кнопка add
 *     b. селектбокс з першим пунктом -Please Select-,
 *     який має такі функціональні елементи (1. Set active, 2. Set not active, 3. Delete)
 *     c. кнопку OK

 * -----------Таблиця	

 * 1. Поле чекбокс (логіка роботи стандартна - натиснув і всі стали обрані,	
 * відтиснув якийсь один і віджався верхній загальний, тому що не всі обрані). Це чек-бокс для групових дій	
 * 2. Name (First Name Last Name)	
 * 3. Status (виводимо зелене коло, якщо актив, і сіре, якщо ні)	
 * 4. Role (admin/user)	
 * 5. Options складається з двох кнопок	
 *     а. Edit (іконки)
 *     b. Delete (іконки)

 * -----------форма додавання/правок (модальне вікно бутстрап)	
 * має бути ОДНЕ вікно на додавання та редагування	
 * складається з наступних полів	
 * 1. First Name (текст)	
 * 2. Last Name (текст)	
 * 3. Status (тогл, як у гугла, полоска с кружечком,	
 * https://support.google.com/fit/thread/128399082/guideline-of-the-toggle-switch-button-for-google-fit-app?hl=en	
 * 4. Role (селект бокс)	

 * -----------модальні вікна (не повинно бути системних конфірмів):	
 * - підтвердження видалення користувача перед видаленням (конфірм-вікно)	
 * - вікно попередження, що не обрані користувачі, а в селектбоксі обрана опція та натиснута кнопка «ОК»	
 * - вікно попередження, що обраний користувач, натиснута кнопка «ОК», але не вибрано дію в селектбоксі	

 * -----------бекенд	
 * тут PHP і, звичайно, mysql	

 * -----------розгорнути де-небудь для перевірки, скинути гіт лінк для перевірки коду	
 * скинути лінк на розгорнутий проект	
 * скинути лінк на гіт	

 * валідація на беку обов'язкова на не порожні поля, на фронті - за бажанням	
 * методи беку повинні відповідати такому вигляду та формату	
 * Приклади:	
 * {status: false, error:{code: 100, message: "not found user"}}	

 * {status: true, error:null, id: 1}	

 * {status: true, error:null, user: {	
 * id: 1,	
 * name_first: "Test1",	
 * name_last: "Test2",	
 * status: true	
 * }}	

 * - хостинг може бути будь-який	
*/

?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>User Manager</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
        crossorigin="anonymous">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">

</head>

<body>
    <div class="container mt-5">
        <h1 class="mb-4">User Manager</h1>

        <?php require 'includes/control-panel.php'; ?>

        <div class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>
                            <input type="checkbox" class="form-check-input" id="selectAllUsers">
                        </th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Role</th>
                        <th>Options</th>
                    </tr>
                </thead>
                <tbody id="usersTableBody">
                    <?php foreach ($users as $user): ?>
                        <tr data-user-id="<?= (int)$user['id'] ?>">
                            <td>
                                <input
                                    type="checkbox"
                                    class="form-check-input user-checkbox"
                                    value="<?= (int)$user['id'] ?>"
                                >
                            </td>

                            <td>
                                <?= htmlspecialchars($user['name_first']) ?>
                                <?= htmlspecialchars($user['name_last']) ?>
                            </td>

                            <td class="status-cell">
                                <span class="fs-4 <?= (int)$user['status'] === 1 ? 'text-success' : 'text-secondary' ?>">●</span>
                            </td>

                            <td>
                                <?= htmlspecialchars($user['role']) ?>
                            </td>

                            <td>
                                <button
                                    type="button"
                                    class="btn btn-sm btn-outline-primary edit-user"
                                    data-id="<?= (int)$user['id'] ?>">
                                    <i class="bi bi-pencil"></i>
                                </button>

                                <button
                                    type="button"
                                    class="btn btn-sm btn-outline-danger delete-user"
                                    data-id="<?= (int)$user['id'] ?>">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <?php require 'includes/control-panel.php'; ?>

    </div>

    <?php require 'includes/user-modal.php'; ?>
    <?php require 'includes/delete-modal.php'; ?>
    <?php require 'includes/message-modal.php'; ?>

    <script src="https://code.jquery.com/jquery-3.7.1.js" 
        integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" 
        crossorigin="anonymous"></script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI"
        crossorigin="anonymous"></script>

    <script src="assets/js/app.js"></script>


</body>

</html>