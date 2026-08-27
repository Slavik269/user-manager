$(document).ready(function () {

    const API_URL = 'api/users.php';

    $('.add-user').on('click', function () {

        resetUserFormErrors();

        $('#userModalTitle').text('Add User');
        $('#userId').val('');
        $('#firstName').val('');
        $('#lastName').val('');
        $('#userStatus').prop('checked', true);
        $('#userRole').val('user');

        const modal = bootstrap.Modal.getOrCreateInstance(
            document.getElementById('userModal')
        );

        modal.show();
    });

    $(document).on('click', '.edit-user', function () {
        
        const userId = $(this).data('id');

        $.ajax({
            url: API_URL,
            method: 'GET',
            data: {
                id: userId
            },
            dataType: 'json',

            success: function (response) {

                if (response.status === true) {

                    resetUserFormErrors();

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
            error: handleAjaxError
        });
    });

    $(document).on('click', '.delete-user', function () {

        const userId = $(this).data('id');

        $('#confirmDelete').removeData('ids');
        $('#confirmDelete').data('id', userId);

        showDeleteUsers([userId]);

        const modal = new bootstrap.Modal('#deleteModal');
        modal.show();
    });

    $('#confirmDelete').on('click', function () {

        const userId = $(this).data('id');
        const userIds = $(this).data('ids');

        const ids = userIds || [userId];

        $.ajax({
            url: API_URL,
            method: 'DELETE',
            contentType: 'application/json',
            data: JSON.stringify({
                ids: ids
            }),
            dataType: 'json',

            success: function (response) {

                if (response.status === true) {

                    const modal = bootstrap.Modal.getInstance(
                        document.getElementById('deleteModal')
                    );

                    modal.hide();
                    resetSelection();

                    ids.forEach(function (id) {
                        $(`tr[data-user-id="${id}"]`).remove();
                    });

                } else {
                    showMessage(response.error.message);
                }
            },
            error: handleAjaxError
        });
    });

    $('#deleteModal').on('hidden.bs.modal', function () {

        $('#confirmDelete').removeData('id');
        $('#confirmDelete').removeData('ids');

    });

    $(document).on('change', '#selectAllUsers', function () {

        $('.user-checkbox').prop('checked', this.checked);

    });

    $(document).on('change', '.user-checkbox', function () {

        const totalUsers = $('.user-checkbox').length;
        const selectedUsers = $('.user-checkbox:checked').length;

        $('#selectAllUsers').prop(
            'checked',
            totalUsers > 0 && totalUsers === selectedUsers
        );

    });

    $(document).on('click', '.bulk-ok', function () {

        const actionSelect = $(this).siblings('.bulk-action');
        const action = actionSelect.val();

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

            showDeleteUsers(selectedUsers);

            const modal = new bootstrap.Modal('#deleteModal');
            modal.show();

            return;
        }

        $.ajax({
            url: API_URL,
            method: 'POST',
            data: {
                action: action,
                users: selectedUsers
            },
            dataType: 'json',

            success: function (response) {

                if (response.status === true) {

                    selectedUsers.forEach(function (id) {

                        if (response.not_found.includes(Number(id))) {

                            $(`tr[data-user-id="${id}"]`).remove();

                        } else {

                            $(`tr[data-user-id="${id}"] .status-cell span`)
                                .toggleClass('text-success', action === 'active');
                        }
                    });
                    
                    if (response.not_found.length > 0) {

                        showMessage(
                            'Some selected users have already been deleted from the database.'
                        );
                    }

                    resetSelection();

                } else {

                    showMessage(response.error.message);
                }
            },
            error: handleAjaxError
        });
    });

    $('#saveUser').on('click', function () {

        resetUserFormErrors();

        const nameFirst = $('#firstName').val().trim();
        const nameLast = $('#lastName').val().trim();

        let hasError = false;

        if (nameFirst === '') {
            $('#firstNameError').removeClass('d-none');
            hasError = true;
        }

        if (nameLast === '') {
            $('#lastNameError').removeClass('d-none');
            hasError = true;
        }

        if (hasError) {
            return;
        }

        const userData = {
            id: $('#userId').val(),
            name_first: $('#firstName').val(),
            name_last: $('#lastName').val(),
            status: $('#userStatus').is(':checked') ? 1 : 0,
            role: $('#userRole').val()
        };

        $.ajax({
            url: API_URL,
            method: 'POST',
            data: userData,
            dataType: 'json',

                success: function (response) {

                    if (response.status === true) {

                        $('#userFormError').addClass('d-none').text('');
                        
                        const modal = bootstrap.Modal.getInstance(
                            document.getElementById('userModal')
                        );

                        modal.hide();

                        const user = {
                            id: response.id,
                            name_first: userData.name_first,
                            name_last: userData.name_last,
                            status: userData.status,
                            role: userData.role
                        };

                        if (userData.id === '') {

                            const selectAllChecked = $('#selectAllUsers').prop('checked');

                            $('#usersTableBody').append(buildUserRow(user));

                            if (selectAllChecked) {
                                $(`tr[data-user-id="${response.id}"] .user-checkbox`)
                                    .prop('checked', true);
                            }

                        } else {

                            $(`tr[data-user-id="${userData.id}"]`)
                                .replaceWith(buildUserRow(user));
                        }

                    } else {

                        $('#userFormError')
                            .removeClass('d-none')
                            .text(response.error.message);

                    }
                },

            error: handleAjaxError
        });

    });

    function handleAjaxError(xhr) {

        console.log('Помилка Ajax:', xhr.responseText);

        showMessage('Сталася помилка з’єднання з сервером.');

    }
    
    function resetSelection() {

        $('#selectAllUsers').prop('checked', false);
        $('.user-checkbox').prop('checked', false);
        $('.bulk-action').val('');

    }

    function showMessage(message) {

        $('#messageModalBody').text(message);

        const modal = new bootstrap.Modal('#messageModal');
        modal.show();
    }

    function buildUserRow(user) {

        const activeClass = user.status == 1
            ? 'text-success'
            : '';

        return `
            <tr data-user-id="${user.id}">
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

                <td class="status-cell">
                    <span
                        class="fs-4 ${activeClass}"
                        style="color: var(--bs-secondary);">
                        ●
                    </span>
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
    }
    
    function resetUserFormErrors() {

        $('#userFormError')
            .addClass('d-none')
            .text('');

        $('#firstNameError').addClass('d-none');
        $('#lastNameError').addClass('d-none');
        }
    

    function showDeleteUsers(ids) {

        const container = $('#deleteUsersList').empty();
        let count = 0;

        ids.forEach(function (id) {

            const row = $(`tr[data-user-id="${id}"]`);
            const name = row.find('td').eq(1).text().trim();

            if (name && count < 5) {
                $('<div>').text(name).appendTo(container);
                count++;
            }
        });

        if (ids.length > 5) {
            $('<div>')
                .text(`... and ${ids.length - 5} more`)
                .appendTo(container);
        }
    }

});


