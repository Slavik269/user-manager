<!-- Додавання користувача -->

<div class="modal fade" id="userModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title" id="userModalTitle">Add User</h5>

                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close">
                </button>
            </div>

            <div class="modal-body">

                <input type="hidden" id="userId">

                <div class="mb-3">
                    <label for="firstName" class="form-label">
                        First name
                    </label>

                    <input
                        type="text"
                        class="form-control"
                        id="firstName"
                        placeholder="Enter first name">
                </div>

                <div class="mb-3">
                    <label for="lastName" class="form-label">
                        Last name
                    </label>

                    <input
                        type="text"
                        class="form-control"
                        id="lastName"
                        placeholder="Enter last name">
                </div>

                <div class="mb-3">
                    <div class="form-label d-block">
                        Status
                    </div>

                    <div class="form-check form-switch">
                        <input
                            class="form-check-input"
                            type="checkbox"
                            id="userStatus">

                        <label class="form-check-label" for="userStatus">
                            Active
                        </label>
                    </div>
                </div>

                <div class="mb-3">
                    <label
                        for="userRole"
                        class="form-label">
                        Role
                    </label>

                    <select
                        class="form-select"
                        id="userRole">

                        <option value="user">User</option>
                        <option value="admin">Admin</option>

                    </select>
                </div>

            </div>

            <div class="modal-footer">

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal">
                    Cancel
                </button>

                <button
                    type="button"
                    class="btn btn-primary"
                    id="saveUser">
                    Save
                </button>

            </div>

        </div>
    </div>
</div>