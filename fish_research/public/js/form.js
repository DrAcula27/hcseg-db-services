document.addEventListener('DOMContentLoaded', function () {
  const trapSampleForm = document.getElementById('trapSampleForm');
  const responseMessage = document.getElementById('responseMessage');
  const responseModal = document.getElementById('responseModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalOverlay = responseModal.querySelector('.modal-overlay');

  // Close modal when close button is clicked
  modalCloseBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside the modal content
  modalOverlay.addEventListener('click', closeModal);

  // close modal when escape key is pressed
  document.addEventListener('keydown', function (event) {
    if (
      event.key === 'Escape' &&
      !responseModal.classList.contains('hidden')
    ) {
      closeModal();
    }
  });

  function closeModal() {
    responseModal.classList.add('hidden');
    responseMessage.innerHTML = '';
  }

  function openModal(message, isSuccess) {
    responseMessage.innerHTML = `<p>${message}</p>`;
    responseMessage.className = isSuccess ? 'success' : 'error';
    responseModal.classList.remove('hidden');
  }

  trapSampleForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const trapOperatingRadio = document.querySelector(
      'input[name="trapOperating"]:checked',
    );

    const formData = {
      date: document.getElementById('date').value,
      time: document.getElementById('time').value,
      trapOperating: trapOperatingRadio
        ? trapOperatingRadio.value
        : '',
      rpm: document.getElementById('rpm').value,
      debris: document.getElementById('debris-select').value,
      waterTemp: document.getElementById('waterTemp').value,
      hoboTemp: document.getElementById('hoboTemp').value,
      visibility: document.getElementById('visibility-select').value,
      flow: document.getElementById('flow-select').value,
      chumCaught: document.getElementById('chumCaught').value,
      chumDnaTaken: document.getElementById('chumDnaTaken').value,
      chumMarked: document.getElementById('chumMarked').value,
      chumMarkedRecap:
        document.getElementById('chumMarkedRecap').value,
      chumMorts: document.getElementById('chumMorts').value,
      chumDnaIds: document.getElementById('chumDnaIds').value,
      chumMortsMarked:
        document.getElementById('chumMortsMarked').value,
      chumMortsRecap: document.getElementById('chumMortsRecap').value,
      cohoFryCaught: document.getElementById('cohoFryCaught').value,
      cohoSmoltCaught:
        document.getElementById('cohoSmoltCaught').value,
      cohoSmoltMarked:
        document.getElementById('cohoSmoltMarked').value,
      cohoSmoltMarkedRecap: document.getElementById(
        'cohoSmoltMarkedRecap',
      ).value,
      cohoFryMorts: document.getElementById('cohoFryMorts').value,
      cohoSmoltMorts: document.getElementById('cohoSmoltMorts').value,
      cohoSmoltMortsMarked: document.getElementById(
        'cohoSmoltMortsMarked',
      ).value,
      cohoSmoltMortsRecap: document.getElementById(
        'cohoSmoltMortsRecap',
      ).value,
      cohoParrCaught: document.getElementById('cohoParrCaught').value,
      steelheadCaught:
        document.getElementById('steelheadCaught').value,
      steelheadMarked:
        document.getElementById('steelheadMarked').value,
      steelheadMarkedRecap: document.getElementById(
        'steelheadMarkedRecap',
      ).value,
      cohoParrMorts: document.getElementById('cohoParrMorts').value,
      steelheadMorts: document.getElementById('steelheadMorts').value,
      steelheadMortsMarked: document.getElementById(
        'steelheadMortsMarked',
      ).value,
      steelheadMortsRecap: document.getElementById(
        'steelheadMortsRecap',
      ).value,
      cutthroatCaught:
        document.getElementById('cutthroatCaught').value,
      chinookCaught: document.getElementById('chinookCaught').value,
      sculpinCaught: document.getElementById('sculpinCaught').value,
      lampreyCaught: document.getElementById('lampreyCaught').value,
      cutthroatMorts: document.getElementById('cutthroatMorts').value,
      chinookMorts: document.getElementById('chinookMorts').value,
      sculpinMorts: document.getElementById('sculpinMorts').value,
      lampreyMorts: document.getElementById('lampreyMorts').value,
      comments: document.getElementById('comments').value,
    };

    // Determine the API endpoint based on the project context
    const projectName = window.currentProject;
    const apiEndpoint =
      projectName === 'Union_Outmigration'
        ? '/api/Union_Outmigration'
        : `/api/${projectName}`;

    console.log('Project:', projectName);
    console.log('API Endpoint:', apiEndpoint);
    console.log('Form Data:', formData);

    // show loading state
    openModal('Submitting...', null);

    fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          return response.json().then((data) => {
            console.error('Server error response:', data);
            throw new Error(
              `HTTP error! status: ${response.status} - ${data.message || data.error}`,
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('Success response:', data);
        openModal(data.message, true);
        // Reset form after successful submission
        // trapSampleForm.reset();
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        openModal(
          'Error submitting the form. Please try again later.',
          false,
        );
      });
  });
});
