/**
 * Handles the "Trap Status" button flow:
 *  1. Opens a focused modal to collect Date, Time, and Comment.
 *  2. On "Apply to Form", pre-fills every main form field with null
 *     values, then populates Date, Time, and Comments with the user's
 *     choices so they can review before submitting.
 */

(function () {
  const TRAP_STATUS_DEFAULTS = {
    'Trap Operating': 'N',
    RPM: 0,
    Debris: 'null',
    Visibility: 'null',
    Flow: 'null',
    'Water Temp': 0,
    'Hobo Temp': 0,
    'Chum Fry': 0,
    'Chum Fry Mort': 0,
    'Chum DNA Taken': 0,
    'Chum DNA IDs': '-',
    'Chum Marked': 0,
    'Chum Marked Mort': 0,
    'Chum Recap': 0,
    'Chum Recap Mort': 0,
    'Coho Fry': 0,
    'Coho Fry Mort': 0,
    'Coho Parr': 0,
    'Coho Parr Mort': 0,
    'Coho Smolt': 0,
    'Coho Smolt Mort': 0,
    'Coho Smolt Marked': 0,
    'Coho Smolt Marked Mort': 0,
    'Coho Smolt Recap': 0,
    'Coho Smolt Recap Mort': 0,
    Steelhead: 0,
    'Steelhead Mort': 0,
    'Steelhead Marked': 0,
    'Steelhead Marked Mort': 0,
    'Steelhead Recap': 0,
    'Steelhead Recap Mort': 0,
    Cutthroat: 0,
    'Cutthroat Mort': 0,
    Chinook: 0,
    'Chinook Mort': 0,
    Sculpin: 0,
    'Sculpin Mort': 0,
    Lamprey: 0,
    'Lamprey Mort': 0,
  };

  /** Set a field value by its [name] attribute, handling radios/selects. */
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
    } else if (first.tagName === 'SELECT') {
      first.value = String(value);
    } else {
      first.value =
        value !== null && value !== undefined ? value : '';
    }
  }

  /** Today's date as YYYY-MM-DD (local time). */
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
  const mainForm = document.getElementById('unionOutmigrationForm');

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
    const commentRadio = trapStatusModal.querySelector(
      'input[name="trapStatusComment"]:checked',
    );

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
    if (!commentRadio) {
      return;
    }

    const comment = commentRadio.value;

    // 1. Fill every zero/null field
    Object.entries(TRAP_STATUS_DEFAULTS).forEach(([field, val]) => {
      setFieldByName(mainForm, field, val);
    });

    // 2. Fill Date, Time, Comments from modal
    setFieldByName(mainForm, 'Date', date);
    setFieldByName(mainForm, 'Time', time);
    const commentsTextarea = mainForm.querySelector('#comments');
    if (commentsTextarea) commentsTextarea.value = comment;

    // 3. Close modal and scroll to top of form so user can review
    closeModal();
    mainForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
