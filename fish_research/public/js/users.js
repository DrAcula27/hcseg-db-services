document.addEventListener('DOMContentLoaded', function () {
  const editButtons = document.querySelectorAll('.btn-edit');
  const deleteButtons = document.querySelectorAll('.btn-delete');
  // const createUserBtn = document.getElementById('createUserBtn');
  const createUserForm = document.getElementById('create-user-form');

  // when user clicks an edit button, make the table fields editable and change the button to a save button
  editButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
      const userId = this.getAttribute('data-user-id');
      const row = this.closest('tr');
      const usernameCell = row.querySelector(
        'td[data-label="Username"]',
      );
      const emailCell = row.querySelector('td[data-label="Email"]');
      const roleCell = row.querySelector('td[data-label="Role"]');
      const actionsCell = row.querySelector(
        'td[data-label="Actions"]',
      );

      if (this.textContent === 'Edit') {
        // change to save button
        this.textContent = 'Save';
        this.classList.remove('btn-edit');
        this.classList.add('btn-save');
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
                  data.message || 'Failed to update user',
                );
              });
            }
            return response.json();
          })
          .then((data) => {
            alert(data.message);
            // change back to edit button
            this.textContent = 'Edit';
            this.classList.remove('btn-save');
            this.classList.add('btn-edit');
            // make cells non-editable
            usernameCell.removeAttribute('contenteditable');
            emailCell.removeAttribute('contenteditable');
            roleCell.removeAttribute('contenteditable');
          })
          .catch((error) => {
            alert(`Error: ${error.message}`);
          });
      }
    });
  });

  // when user clicks a delete button, show a confirmation dialog and delete the user if confirmed
  deleteButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
      const userId = this.getAttribute('data-user-id');
      if (confirm('Are you sure you want to delete this user?')) {
        fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((data) => {
                throw new Error(
                  data.message || 'Failed to delete user',
                );
              });
            }
            return response.json();
          })
          .then((data) => {
            alert(data.message);
            // remove the user's row from the table
            const row = this.closest('tr');
            row.parentNode.removeChild(row);
          })
          .catch((error) => {
            alert(`Error: ${error.message}`);
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
    console.log('newUser payload: ', newUser);

    fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    })
      .then((response) => {
        console.log('Response status: ', response.status);
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
        alert(data.message);
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
          const userId = this.getAttribute('data-user-id');
          const row = this.closest('tr');
          const emailCell = row.querySelector(
            'td[data-label="Email"]',
          );
          const roleCell = row.querySelector('td[data-label="Role"]');
          const actionsCell = row.querySelector(
            'td[data-label="Actions"]',
          );
          if (this.textContent === 'Edit') {
            this.textContent = 'Save';
            this.classList.remove('btn-edit');
            this.classList.add('btn-save');
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
                      data.message || 'Failed to update user',
                    );
                  });
                }
                return response.json();
              })
              .then((data) => {
                alert(data.message);
                this.textContent = 'Edit';
                this.classList.remove('btn-save');
                this.classList.add('btn-edit');
                emailCell.removeAttribute('contenteditable');
                roleCell.removeAttribute('contenteditable');
              })
              .catch((error) => {
                alert(`Error: ${error.message}`);
              });
          }
        });
        newDeleteBtn.addEventListener('click', function () {
          const userId = this.getAttribute('data-user-id');
          if (confirm('Are you sure you want to delete this user?')) {
            fetch(`/api/users/${userId}`, {
              method: 'DELETE',
            })
              .then((response) => {
                if (!response.ok) {
                  return response.json().then((data) => {
                    throw new Error(
                      data.message || 'Failed to delete user',
                    );
                  });
                }
                return response.json();
              })
              .then((data) => {
                alert(data.message);
                const row = this.closest('tr');
                row.parentNode.removeChild(row);
              })
              .catch((error) => {
                alert(`Error: ${error.message}`);
              });
          }
        });

        // reset the form after adding the user to the table
        createUserForm.reset();

        // reload the page to update the user list
        window.location.reload();
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        alert(`Error: ${error.message}`);
      });
  });
});
