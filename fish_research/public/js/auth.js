document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById(
    'confirm-password',
  );
  const togglePwShowBtns = document.querySelectorAll(
    '.btn-toggle-show-password',
  );
  const togglePwShowBtn = togglePwShowBtns[0];
  const toggleConfirmPwShowBtn = togglePwShowBtns[1];

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
