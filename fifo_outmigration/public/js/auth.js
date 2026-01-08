document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('password');
  const togglePwShowBtn = document.querySelector(
    '.btn-toggle-show-password'
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
});
