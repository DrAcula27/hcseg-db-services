const passwordInput = document.getElementById('password');
const togglePwShowBtn = document.getElementsByClassName(
  'btn-toggle-show-password'
);

togglePwShowBtn[0].addEventListener('click', () => {
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
