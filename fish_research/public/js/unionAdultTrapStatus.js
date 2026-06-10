/* *
 * Handles the "Trap Status" button flow:
 *  1. Opens a focused modal to collect Date, Time, and Comments.
 *  2. On "Apply to Form", pre-fills every main form field with null
 *     values, then populates Date, Time, and Comments with the user's
 *     choices so they can review before submitting.
 */

(function () {
  const TRAP_STATUS_DEFAULTS = {
    'Trap Operating': 'N',
    'Number of Visitors': 0,
    'Chum Males': 0,
    'Chum Females': 0,
    'Coho Males - Adipose Present': 0,
    'Coho Females - Adipose Present': 0,
    'Coho Males - Adipose Absent': 0,
    'Coho Females - Adipose Absent': 0,
    'Chinook Males - Adipose Present': 0,
    'Chinook Females - Adipose Present': 0,
    'Chinook Males - Adipose Absent': 0,
    'Chinook Females - Adipose Absent': 0,
    'Pink Males': 0,
    'Pink Females': 0,
  };

  // * Set a field value by its [name] attribute, handling radios.
  function setFieldByName(form, fieldName, value) {
    const els = form.querySelectorAll(
      `[name="${CSS.escape(fieldName)}"]`,
    );

    if (!els.length) return;

    const first = els[0];

    if (first.type === 'radio') {
      els.forEach((el) => {
        el.checked = el.value === String(value);
      });
    } else {
      first.value =
        value !== null && value !== undefined ? value : '';
    }
  }

  // * Today's date as YYYY-MM-DD (local time).
  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  const trapStatusBtn = document.getElementById('trapStatusBtn');
  const trapStatusModal = document.getElementById('trapStatusModal');
  const trapStatusModalOverlay = document.getElementById(
    'trapStatusModalOverlay',
  );
  const trapStatusModalCloseBtn = document.getElementById(
    'trapStatusModalCloseBtn',
  );
  const trapStatusApplyBtn = document.getElementById(
    'trapStatusApplyBtn',
  );
  const trapStatusDateInput =
    document.getElementById('trapStatusDate');
  const trapStatusTimeInput =
    document.getElementById('trapStatusTime');
  const trapStatusCommentsInput = document.getElementById(
    'trapStatusComments',
  );
  const mainForm = document.getElementById('unionAdultReturnForm');

  if (!trapStatusBtn || !trapStatusModal || !mainForm) return; // guard

  function openModal() {
    // Restrict date to today or earlier
    trapStatusDateInput.max = todayISO();
    // Default time to midnight if not already set
    if (!trapStatusTimeInput.value) {
      trapStatusTimeInput.value = '00:00';
    }
    trapStatusModal.classList.remove('hidden');
    trapStatusDateInput.focus();
  }

  function closeModal() {
    trapStatusModal.classList.add('hidden');
  }

  trapStatusBtn.addEventListener('click', openModal);
  trapStatusModalCloseBtn.addEventListener('click', closeModal);
  trapStatusModalOverlay.addEventListener('click', closeModal);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'Escape' &&
      !trapStatusModal.classList.contains('hidden')
    ) {
      closeModal();
    }
  });

  trapStatusApplyBtn.addEventListener('click', () => {
    // Validate modal fields
    const date = trapStatusDateInput.value;
    const time = trapStatusTimeInput.value;
    const comments = trapStatusCommentsInput.value.trim();

    if (!date) {
      trapStatusDateInput.focus();
      trapStatusDateInput.reportValidity();
      return;
    }
    if (!time) {
      trapStatusTimeInput.focus();
      trapStatusTimeInput.reportValidity();
      return;
    }
    if (!comments) {
      trapStatusCommentsInput.focus();
      trapStatusCommentsInput.reportValidity();
      return;
    }

    // 1. Fill every zero/null field
    Object.entries(TRAP_STATUS_DEFAULTS).forEach(([field, val]) => {
      setFieldByName(mainForm, field, val);
    });

    // 2. Fill Date, Time, Comments from modal
    setFieldByName(mainForm, 'Date', date);
    setFieldByName(mainForm, 'Time', time);

    // combine value of radio button "Trap Status" with comments
    const trapStatus = document.querySelector(
      'input[name="Trap Status"]:checked',
    );
    if (trapStatus) {
      setFieldByName(
        mainForm,
        'Comments',
        `${trapStatus.value} ${comments}`,
      );
    } else {
      setFieldByName(mainForm, 'Comments', comments);
    }

    // 3. Close modal and scroll to top of form so user can review
    closeModal();
    mainForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
