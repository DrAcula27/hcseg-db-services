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

  // Password rules live validation
  const ruleLength = document.getElementById('rule-length');
  const ruleLetter = document.getElementById('rule-letter');
  const ruleNumber = document.getElementById('rule-number');
  const passwordMatchMessage = document.getElementById(
    'password-match-message',
  );

  function updateRules(pw) {
    if (!ruleLength || !ruleLetter || !ruleNumber) return;
    if (pw.length >= 8) {
      ruleLength.classList.add('valid');
      ruleLength.classList.remove('invalid');
    } else {
      ruleLength.classList.add('invalid');
      ruleLength.classList.remove('valid');
    }
    if (/[A-Za-z]/.test(pw)) {
      ruleLetter.classList.add('valid');
      ruleLetter.classList.remove('invalid');
    } else {
      ruleLetter.classList.add('invalid');
      ruleLetter.classList.remove('valid');
    }
    if (/\d/.test(pw)) {
      ruleNumber.classList.add('valid');
      ruleNumber.classList.remove('invalid');
    } else {
      ruleNumber.classList.add('invalid');
      ruleNumber.classList.remove('valid');
    }
  }

  function updateMatchMessage() {
    if (
      !passwordInput ||
      !confirmPasswordInput ||
      !passwordMatchMessage
    )
      return;
    if (confirmPasswordInput.value.length === 0) {
      passwordMatchMessage.textContent = '';
      passwordMatchMessage.classList.remove('error-msg');
      passwordMatchMessage.classList.remove('success-msg');
      passwordMatchMessage.classList.add('hidden');
      return;
    }
    if (passwordInput.value === confirmPasswordInput.value) {
      passwordMatchMessage.textContent = 'Passwords match ✓';
      passwordMatchMessage.classList.remove('hidden');
      passwordMatchMessage.classList.remove('error-msg');
      passwordMatchMessage.classList.add('success-msg');
    } else {
      passwordMatchMessage.textContent = 'Passwords do not match ✗';
      passwordMatchMessage.classList.remove('hidden');
      passwordMatchMessage.classList.remove('success-msg');
      passwordMatchMessage.classList.add('error-msg');
    }
  }

  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      updateRules(e.target.value);
      updateMatchMessage();
    });
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', () => {
      updateMatchMessage();
    });
  }
});
