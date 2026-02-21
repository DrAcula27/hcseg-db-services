document.addEventListener('DOMContentLoaded', function () {
  const editButtons = document.querySelectorAll('.btn-edit');
  const deleteButtons = document.querySelectorAll('.btn-delete');
  const createUserForm = document.getElementById('create-user-form');
  const responseMessage = document.getElementById('responseMessage');
  const responseModal = document.getElementById('responseModal');
  const responseModalCloseBtn = document.getElementById(
    'responseModalCloseBtn',
  );
  const modalOverlayList =
    document.querySelectorAll('.modal-overlay');
  const confirmDeleteModal = document.getElementById(
    'confirmDeleteModal',
  );
  const confirmDeleteCloseBtn = document.getElementById(
    'confirmDeleteCloseBtn',
  );
  const confirmDeleteMessage = document.getElementById(
    'confirmDeleteMessage',
  );
  const confirmDeleteBtn = document.getElementById(
    'confirmDeleteBtn',
  );
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  let resolveDeleteModal = null;

  // close either modal when close button is clicked
  responseModalCloseBtn.addEventListener('click', closeModal);
  confirmDeleteCloseBtn.addEventListener('click', closeModal);

  // close either modal when clicking outside the modal content
  modalOverlayList.forEach((modalOverlay) => {
    modalOverlay.addEventListener('click', closeModal);
  });

  // close either modal when escape key is pressed
  document.addEventListener('keydown', function (event) {
    if (
      event.key === 'Escape' &&
      !responseModal.classList.contains('hidden')
    ) {
      closeModal();
    }

    if (
      event.key === 'Escape' &&
      !confirmDeleteModal.classList.contains('hidden')
    ) {
      closeModal();

      // cancel the delete action
      if (resolveDeleteModal) {
        resolveDeleteModal(false);
        resolveDeleteModal = null;
      }
    }
  });

  // close either modal when enter key is pressed
  document.addEventListener('keydown', function (event) {
    if (
      event.key === 'Enter' &&
      !responseModal.classList.contains('hidden')
    ) {
      event.preventDefault();
      closeModal();
    }

    if (
      event.key === 'Enter' &&
      !confirmDeleteModal.classList.contains('hidden')
    ) {
      event.preventDefault();
      closeModal();

      // confirm the delete action
      if (resolveDeleteModal) {
        resolveDeleteModal(true);
        resolveDeleteModal = null;
      }
    }
  });

  function closeModal() {
    responseModal.classList.add('hidden');
    responseMessage.innerHTML = '';
    confirmDeleteModal.classList.add('hidden');
    resolveDeleteModal = null;
  }

  function openResponseModal(message, isSuccess) {
    responseMessage.innerHTML = `<p>${message}</p>`;
    responseMessage.className = isSuccess ? 'success' : 'error';
    responseModal.classList.remove('hidden');
  }

  function openConfirmDeleteModal(message) {
    confirmDeleteMessage.textContent = message;
    confirmDeleteModal.classList.remove('hidden');
    return new Promise((resolve) => {
      resolveDeleteModal = resolve;
      confirmDeleteBtn.onclick = function () {
        closeModal();
        resolve(true);
      };
      cancelDeleteBtn.onclick = function () {
        closeModal();
        resolve(false);
      };
    });
  }

  // when user clicks an edit button,
  //   make the table fields editable,
  //   change the edit button to a save button, and
  //   add a cancel button below the save button
  function handleEditClick(btn) {
    const userId = btn.getAttribute('data-user-id');
    const row = btn.closest('tr');
    const usernameCell = row.querySelector(
      'td[data-label="Username"]',
    );
    const emailCell = row.querySelector('td[data-label="Email"]');
    const roleCell = row.querySelector('td[data-label="Role"]');
    const actionsCell = row.querySelector('td[data-label="Actions"]');

    if (btn.textContent === 'Edit') {
      // store original values in case user cancels edit
      const originalUsername = usernameCell.textContent.trim();
      const originalEmail = emailCell.textContent.trim();
      const originalRole = roleCell.textContent.trim();

      // change Edit button to Save button
      btn.textContent = 'Save';
      btn.classList.remove('btn-edit');
      btn.classList.add('btn-save');

      // make username, email, and role cells editable
      usernameCell.setAttribute('contenteditable', 'true');
      emailCell.setAttribute('contenteditable', 'true');
      const roleSelect = document.createElement('select');
      roleSelect.classList.add('role-select');
      ['admin', 'user'].forEach((role) => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role.toLowerCase();
        if (role === originalRole) {
          option.selected = true;
        }
        roleSelect.appendChild(option);
      });
      roleCell.textContent = '';
      roleCell.appendChild(roleSelect);

      // add a cancel button below the save button
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.classList.add('btn', 'btn-cancel-edit');
      actionsCell.appendChild(cancelBtn);
      cancelBtn.addEventListener('click', function () {
        // revert to original values
        usernameCell.textContent = originalUsername;
        emailCell.textContent = originalEmail;
        roleCell.textContent = originalRole;

        // revert save button back to edit button
        btn.textContent = 'Edit';
        btn.classList.remove('btn-save');
        btn.classList.add('btn-edit');

        // remove cancel button and make cells non-editable
        cancelBtn.remove();
        usernameCell.removeAttribute('contenteditable');
        emailCell.removeAttribute('contenteditable');
        roleCell.removeAttribute('contenteditable');
      });
    } else {
      // read role from select element instead of text content
      const roleSelect = roleCell.querySelector('.role-select');
      const updatedRole = roleSelect
        ? roleSelect.value
        : roleCell.textContent.trim();

      // save changes
      fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameCell.textContent.trim(),
          email: emailCell.textContent.trim(),
          role: updatedRole,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(data.error || 'Failed to update user');
            });
          }
          return response.json();
        })
        .then((data) => {
          openResponseModal(data.message, true);

          // change save button back to edit button
          btn.textContent = 'Edit';
          btn.classList.remove('btn-save');
          btn.classList.add('btn-edit');

          // make cells non-editable
          usernameCell.removeAttribute('contenteditable');
          emailCell.removeAttribute('contenteditable');
          roleCell.textContent = updatedRole;

          // remove cancel button
          const cancelBtn = actionsCell.querySelector(
            '.btn-cancel-edit',
          );
          if (cancelBtn) cancelBtn.remove();
        })
        .catch((error) => {
          openResponseModal(`Error: ${error.message}`, false);
        });
    }
  }

  // when user clicks a delete button,
  //   show a confirmation dialog and delete the user if confirmed
  async function handleDeleteClick(btn) {
    const userId = btn.getAttribute('data-user-id');
    const confirmed = await openConfirmDeleteModal(
      'Are you sure you want to delete this user?',
    );
    if (confirmed) {
      fetch(`/api/users/${userId}`, { method: 'DELETE' })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(data.error || 'Failed to delete user');
            });
          }
          return response.json();
        })
        .then((data) => {
          openResponseModal(data.message, true);
          const row = btn.closest('tr');
          row.parentNode.removeChild(row);
        })
        .catch((error) => {
          openResponseModal(`Error: ${error.message}`, false);
        });
    }
  }

  // attach handlers to existing table buttons
  editButtons.forEach((btn) => {
    btn.addEventListener('click', () => handleEditClick(btn));
  });

  deleteButtons.forEach((btn) => {
    btn.addEventListener('click', () => handleDeleteClick(btn));
  });

  // when user clicks the create user button,
  //   create the user using the values in the input fields
  //   and add the new user to the table
  createUserForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const roleInput = document.getElementById('role');
    const passwordInput = document.getElementById('password');
    const newUser = {
      username: usernameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value.trim(),
      role: roleInput.value.trim(),
    };

    // show loading state
    openResponseModal('Submitting...', null);

    fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            console.error('Server error response:', data);
            throw new Error(
              `HTTP error! <br> status: ${response.status} - ${data.message || data.error}`,
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        openResponseModal(data.message, true);

        // add the new user to the table
        const usersTable = document
          .getElementById('usersTable')
          .getElementsByTagName('tbody')[0];
        const newRow = usersTable.insertRow();
        newRow.innerHTML = `
          <td data-label="Username">${data.user.username}</td>
          <td data-label="Email">${data.user.email}</td>
          <td data-label="Role">${data.user.role}</td>
          <td data-label="Actions">
            <div>
              <button class="btn btn-edit" data-user-id="${data.user.id}">Edit</button>
              <button class="btn btn-delete" data-user-id="${data.user.id}">Delete</button>
            </div>
          </td>
        `;

        // attach event listeners to the new edit and delete buttons
        const newEditBtn = newRow.querySelector('.btn-edit');
        const newDeleteBtn = newRow.querySelector('.btn-delete');
        newEditBtn.addEventListener('click', () =>
          handleEditClick(newEditBtn),
        );
        newDeleteBtn.addEventListener('click', () =>
          handleDeleteClick(newDeleteBtn),
        );

        // reset the form after adding the user to the table
        createUserForm.reset();
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        openResponseModal(
          `Error creating user: <br> ${error.message}`,
          false,
        );
      });
  });
});
