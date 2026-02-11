document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('password');
  const togglePwShowBtn = document.querySelector(
    '.btn-toggle-show-password',
  );
  const confirmPasswordInput = document.getElementById(
    'confirm-password',
  );
  const toggleConfirmPwShowBtn = document.querySelector(
    '.btn-toggle-show-confirm-password',
  );

  if (togglePwShowBtn && passwordInput) {
    togglePwShowBtn.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        document.getElementById('toggle-show-password').textContent =
          'hide';
      } else {
        passwordInput.type = 'password';
        document.getElementById('toggle-show-password').textContent =
          'show';
      }
    });
  }

  if (toggleConfirmPwShowBtn && confirmPasswordInput) {
    toggleConfirmPwShowBtn.addEventListener('click', () => {
      if (confirmPasswordInput.type === 'password') {
        confirmPasswordInput.type = 'text';
        document.getElementById(
          'toggle-show-confirm-password',
        ).textContent = 'hide';
      } else {
        confirmPasswordInput.type = 'password';
        document.getElementById(
          'toggle-show-confirm-password',
        ).textContent = 'show';
      }
    });
  }
});
