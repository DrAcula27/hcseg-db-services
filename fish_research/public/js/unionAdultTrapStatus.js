/* # Union Adult Trap Status Modal
 * Handles the "Trap Status" button flow:
 *  1. Opens a focused modal to collect Date, Time, and Comments.
 *  2. On "Apply to Form", pre-fills every main form field with null
 *     values, then populates Date, Time, and Comments with the user's
 *     choices so they can review before submitting.
 */

(function () {
  const TRAP_STATUS_DEFAULTS = {
    numberOfVisitors: 0,
    chumMales: 0,
    chumFemales: 0,
    cohoMalesAdiposePresent: 0,
    cohoFemalesAdiposePresent: 0,
    cohoMalesAdiposeAbsent: 0,
    cohoFemalesAdiposeAbsent: 0,
    chinookMalesAdiposePresent: 0,
    chinookFemalesAdiposePresent: 0,
    chinookMalesAdiposeAbsent: 0,
    chinookFemalesAdiposeAbsent: 0,
    pinkMales: 0,
    pinkFemales: 0,
  };

  // * Set TRAP_STATUS_DEFAULTS by their [id] attributes.
  function setFieldById(form, id, value) {
    const field = form.querySelector(`#${id}`);
    if (field) {
      field.value = value;
    }
  }

  // * Today's date as YYYY-MM-DD (local time).
  function todayISO() {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // * DOM elements
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

  // * Guard against missing elements.
  if (!trapStatusBtn || !trapStatusModal || !mainForm) return;

  // * Modal handlers
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
      setFieldById(mainForm, field, val);
    });

    // 2. Fill Date, Time, Trap Operating, and Comments from modal
    setFieldById(mainForm, 'time', time);
    setFieldById(mainForm, 'date', date);

    /*
     If the `Trapping Stopped` radio button is selected, the `Trap Operating` the `N` radio button should be checked.
     If the `Trapping Started` radio button is selected, the `Trap Operating` the `Y` radio button should be checked.
    */
    const trapStatus = document.querySelector(
      'input[name="Trap Status"]:checked',
    );
    const trapOperatingYes = document.getElementById('trapOperatingYes');
    const trapOperatingNo = document.getElementById('trapOperatingNo');
    if (trapStatus.value === 'Trapping stopped.') {
      // check the `N` radio button for `Trap Operating`
      trapOperatingNo.checked = true;
    } else if (trapStatus.value === 'Trapping started.') {
      // check the `Y` radio button for `Trap Operating`
      trapOperatingYes.checked = true;
    } else {
      // default to `Y` for `Trap Operating` if no radio button is selected
      trapOperatingYes.checked = true;
    }

    // combine value of radio button "Trap Status" with comments
    if (trapStatus) {
      setFieldById(
        mainForm,
        'comments',
        `${trapStatus.value} ${comments}`,
      );
    } else {
      setFieldById(mainForm, 'comments', comments);
    }

    // 3. Close modal and scroll to top of form so user can review
    closeModal();
    mainForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
