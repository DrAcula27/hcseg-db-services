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

  // when user clicks an edit button, make the table fields editable and change the button to a save button
  editButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
      const userId = btn.getAttribute('data-user-id');
      const row = btn.closest('tr');
      const usernameCell = row.querySelector(
        'td[data-label="Username"]',
      );
      const emailCell = row.querySelector('td[data-label="Email"]');
      const roleCell = row.querySelector('td[data-label="Role"]');
      const actionsCell = row.querySelector(
        'td[data-label="Actions"]',
      );

      if (btn.textContent === 'Edit') {
        // change to save button
        btn.textContent = 'Save';
        btn.classList.remove('btn-edit');
        btn.classList.add('btn-save');
        // make username, email, and role cells editable
        usernameCell.setAttribute('contenteditable', 'true');
        emailCell.setAttribute('contenteditable', 'true');
        roleCell.setAttribute('contenteditable', 'true');
      } else {
        // save changes
        const updatedUsername = usernameCell.textContent.trim();
        const updatedEmail = emailCell.textContent.trim();
        const updatedRole = roleCell.textContent.trim();
        fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: updatedUsername,
            email: updatedEmail,
            role: updatedRole,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((data) => {
                throw new Error(
                  data.error || 'Failed to update user',
                );
              });
            }
            return response.json();
          })
          .then((data) => {
            openResponseModal(data.message, true);
            // change back to edit button
            btn.textContent = 'Edit';
            btn.classList.remove('btn-save');
            btn.classList.add('btn-edit');
            // make cells non-editable
            usernameCell.removeAttribute('contenteditable');
            emailCell.removeAttribute('contenteditable');
            roleCell.removeAttribute('contenteditable');
          })
          .catch((error) => {
            openResponseModal(`Error: ${error.message}`, false);
          });
      }
    });
  });

  // when user clicks a delete button, show a confirmation dialog and delete the user if confirmed
  deleteButtons.forEach((btn) => {
    btn.addEventListener('click', async function () {
      const userId = btn.getAttribute('data-user-id');
      const confirmed = await openConfirmDeleteModal(
        'Are you sure you want to delete this user?',
        null,
      );

      if (confirmed) {
        fetch(`/api/users/${userId}`, { method: 'DELETE' })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((data) => {
                throw new Error(
                  data.error || 'Failed to delete user',
                );
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
    });
  });

  // when user clicks the create user button, create the user using the values in the input fields and add the new user to the table
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
        // add event listeners to the new buttons
        const newEditBtn = newRow.querySelector('.btn-edit');
        const newDeleteBtn = newRow.querySelector('.btn-delete');
        newEditBtn.addEventListener('click', function () {
          const userId = newEditBtn.getAttribute('data-user-id');
          const row = newEditBtn.closest('tr');
          const emailCell = row.querySelector(
            'td[data-label="Email"]',
          );
          const roleCell = row.querySelector('td[data-label="Role"]');
          const actionsCell = row.querySelector(
            'td[data-label="Actions"]',
          );
          if (newEditBtn.textContent === 'Edit') {
            newEditBtn.textContent = 'Save';
            newEditBtn.classList.remove('btn-edit');
            newEditBtn.classList.add('btn-save');
            emailCell.setAttribute('contenteditable', 'true');
            roleCell.setAttribute('contenteditable', 'true');
          } else {
            const updatedEmail = emailCell.textContent.trim();
            const updatedRole = roleCell.textContent.trim();
            fetch(`/api/users/${userId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: updatedEmail,
                role: updatedRole,
              }),
            })
              .then((response) => {
                if (!response.ok) {
                  return response.json().then((data) => {
                    throw new Error(
                      data.error || 'Failed to update user',
                    );
                  });
                }
                return response.json();
              })
              .then((data) => {
                openResponseModal(data.message, true);
                newEditBtn.textContent = 'Edit';
                newEditBtn.classList.remove('btn-save');
                newEditBtn.classList.add('btn-edit');
                emailCell.removeAttribute('contenteditable');
                roleCell.removeAttribute('contenteditable');
              })
              .catch((error) => {
                openResponseModal(`Error: ${error.message}`, false);
              });
          }
        });
        newDeleteBtn.addEventListener('click', async function () {
          const userId = newDeleteBtn.getAttribute('data-user-id');
          const confirmed = await openConfirmDeleteModal(
            'Are you sure you want to delete this user?',
            null,
          );

          if (confirmed) {
            fetch(`/api/users/${userId}`, {
              method: 'DELETE',
            })
              .then((response) => {
                if (!response.ok) {
                  return response.json().then((data) => {
                    throw new Error(
                      data.error || 'Failed to delete user',
                    );
                  });
                }
                return response.json();
              })
              .then((data) => {
                openResponseModal(data.message, true);
                const row = newDeleteBtn.closest('tr');
                row.parentNode.removeChild(row);
              })
              .catch((error) => {
                openResponseModal(`Error: ${error.message}`, false);
              });
          }
        });

        // reset the form after adding the user to the table
        createUserForm.reset();

        // after the user closes the modal, reload the page to sync with the server
        if (!openResponseModal && !confirmDeleteModal) {
          window.location.reload();
        }
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
