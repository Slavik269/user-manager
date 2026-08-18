$(document).ready(function () {

    loadUsers();

    // Відкриваємо modal для додавання нового користувача
    $('.add-user').on('click', function () {

        // Переводимо modal у режим додавання
        $('#userModalTitle').text('Add User');

        // Очищаємо id
        $('#userId').val('');

        // Очищаємо поля форми
        $('#firstName').val('');
        $('#lastName').val('');

        // Встановлюємо значення за замовчуванням
        $('#userStatus').prop('checked', true);
        $('#userRole').val('user');

        const modal = bootstrap.Modal.getOrCreateInstance(
            document.getElementById('userModal')
        );

        modal.show();
    });

    // Відкриваємо вікно для редагування користувача
    $(document).on('click', '.edit-user', function () {
        
        const userId = $(this).data('id');

        $.ajax({
            url: 'api/users.php',
            method: 'GET',
            data: {
                id: userId
            },
            dataType: 'json',

            success: function (response) {

                if (response.status === true) {
                    const user = response.user;

                    $('#userModalTitle').text('Edit User');
                    $('#userId').val(user.id);
                    $('#firstName').val(user.name_first);
                    $('#lastName').val(user.name_last);
                    $('#userStatus').prop('checked', user.status == 1);
                    $('#userRole').val(user.role);

                    const modal = bootstrap.Modal.getOrCreateInstance(
                        document.getElementById('userModal')
                    );

                    modal.show();

                } else {
                    showMessage(response.error.message);
                }
            },
            error: function (xhr) {
                console.log('Помилка Ajax:', xhr.responseText);
            }
        });
    });

    // Відкриваємо вікно підтвердження видалення користувача
    $(document).on('click', '.delete-user', function () {

        const userId = $(this).data('id');
        $('#confirmDelete').data('id', userId);

        const modal = new bootstrap.Modal('#deleteModal');
        modal.show();
    });

    // Підтверджуємо видалення користувача або групи користувачів
    $('#confirmDelete').on('click', function () {

        const userId = $(this).data('id');
        const userIds = $(this).data('ids');

        const ids = userIds || [userId];

        $.ajax({
            url: 'api/users.php',
            method: 'DELETE',
            data: {
                ids: ids
            },
            dataType: 'json',

            success: function (response) {

                if (response.status === true) {

                    // Закриваємо modal після успішного видалення
                    const modal = bootstrap.Modal.getInstance(
                        document.getElementById('deleteModal')
                    );

                    modal.hide();

                    // Очищаємо збережені id
                    $('#confirmDelete').removeData('id');
                    $('#confirmDelete').removeData('ids');

                    // Очищаємо вибір користувачів
                    $('#selectAllUsers').prop('checked', false);
                    $('.user-checkbox').prop('checked', false);

                    // Повертаємо select до початкового значення
                    $('.bulk-action').val('');

                    // Оновлюємо таблицю
                    loadUsers();

                } else {

                    showMessage(response.error.message);
                }
            },
            error: function (xhr) {
                console.log('Помилка Ajax:', xhr.responseText);
            }
        });
    });

    // Вибираємо або знімаємо всіх користувачів
    $(document).on('change', '#selectAllUsers', function () {

        $('.user-checkbox').prop('checked', this.checked);

    });

    // Перевіряємо стан головного чекбокса після зміни окремого користувача
    $(document).on('change', '.user-checkbox', function () {

        const totalUsers = $('.user-checkbox').length;
        const selectedUsers = $('.user-checkbox:checked').length;

        $('#selectAllUsers').prop(
            'checked',
            totalUsers > 0 && totalUsers === selectedUsers
        );

    });

    // Синхронізуємо верхній та нижній select
    $(document).on('change', '.bulk-action', function () {

        const action = $(this).val();

        $('.bulk-action').val(action);

    });

    // Показуємо повідомлення в Bootstrap
    function showMessage(message) {

        $('#messageModalBody').text(message);

        const modal = new bootstrap.Modal('#messageModal');
        modal.show();
    }

    // Обробляємо натискання кнопки підтвердження для групової дії
    $(document).on('click', '.bulk-ok', function () {

        const action = $('.bulk-action').first().val();

        const selectedUsers = $('.user-checkbox:checked')
            .map(function () {
                return $(this).val();
            })
            .get();

        if (selectedUsers.length === 0) {
            showMessage('Please select at least one user.');
            return;
        }

        if (action === '') {

            showMessage('Please select an action.');

            return;
        }

        // Для групового видалення спочатку показуємо підтвердження
        if (action === 'delete') {

            $('#confirmDelete').data('ids', selectedUsers);

            const modal = new bootstrap.Modal('#deleteModal');
            modal.show();

            return;
        }

        $.ajax({
            url: 'api/users.php',
            method: 'POST',
            data: {
                action: action,
                users: selectedUsers
            },
            dataType: 'json',

            success: function (response) {

                if (response.status === true) {

                    loadUsers();

                    // Прибираємо обрані категорії
                    $('#selectAllUsers').prop('checked', false);
                    $('.user-checkbox').prop('checked', false);
                    $('.bulk-action').val('');

                } else {

                    showMessage(response.error.message);
                }
            },
            error: function (xhr) {
                console.log('Помилка Ajax:', xhr.responseText);
            }
        });
    });

    // Зберігаємо нового користувача
    $('#saveUser').on('click', function () {

        const userData = {
            id: $('#userId').val(),
            name_first: $('#firstName').val(),
            name_last: $('#lastName').val(),
            status: $('#userStatus').is(':checked') ? 1 : 0,
            role: $('#userRole').val()
        };

        $.ajax({
            url: 'api/users.php',
            method: 'POST',
            data: userData,
            dataType: 'json',

            success: function (response) {

                if (response.status === true) {
                    const modal = bootstrap.Modal.getInstance(
                        document.getElementById('userModal')
                    );

                    modal.hide();
                    loadUsers();

                } else {

                    showMessage(response.error.message);

                }
            },

            error: function (xhr) {

                console.log('Помилка Ajax:', xhr.responseText);
            }
        });

    });

    // Отримуємо список користувачів з сервера
    function loadUsers() {

        $.ajax({
            url: 'api/users.php',
            method: 'GET',
            dataType: 'json',

            success: function (response) {

                if (response.status === true) {
                    renderUsers(response.users);
                } else {
                    showMessage(response.error.message);
                }

            },

            error: function (xhr) {
                console.log('Помилка Ajax:', xhr.responseText);
            }
        });
    }

    // Створюємо рядки таблиці з отриманих користувачів
    function renderUsers(users) {

        const tableBody = $('#usersTableBody');
        tableBody.empty();

        users.forEach(function (user) {

            const statusCircle = user.status == 1
                ? '<span class="text-success fs-4">●</span>'
                : '<span class="text-secondary fs-4">●</span>';

            const row = `
                <tr>
                    <td>
                        <input
                            type="checkbox"
                            class="form-check-input user-checkbox"
                            value="${user.id}"
                        >
                    </td>

                    <td>
                        ${user.name_first} ${user.name_last}
                    </td>

                    <td>
                        ${statusCircle}
                    </td>

                    <td>
                        ${user.role}
                    </td>

                    <td>
                        <button
                            type="button"
                            class="btn btn-sm btn-outline-primary edit-user"
                            data-id="${user.id}">
                            <i class="bi bi-pencil"></i>
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-danger delete-user"
                            data-id="${user.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            // Додаємо створений рядок у таблицю
            tableBody.append(row);
        });
    }
});

