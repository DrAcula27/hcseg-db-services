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
      'input[name="Trap Operating"]:checked',
    );

    const formData = {
      Date: document.getElementById('date').value,
      Time: document.getElementById('time').value,
      'Trap Operating': trapOperatingRadio
        ? trapOperatingRadio.value
        : '',
      RPM: document.getElementById('rpm').value,
      Debris: document.getElementById('debris-select').value,
      'Water Temp': document.getElementById('waterTemp').value,
      'Hobo Temp': document.getElementById('hoboTemp').value,
      Visibility: document.getElementById('visibility-select').value,
      Flow: document.getElementById('flow-select').value,
      'Chum Fry': document.getElementById('chumCaught').value,
      'Chum DNA Taken': document.getElementById('chumDnaTaken').value,
      'Chum Marked': document.getElementById('chumMarked').value,
      'Chum Recap': document.getElementById('chumMarkedRecap').value,
      'Chum Fry Mort': document.getElementById('chumMorts').value,
      'Chum DNA IDs': document.getElementById('chumDnaIds').value,
      'Chum Mort Marked':
        document.getElementById('chumMortsMarked').value,
      'Chum Mort Recap':
        document.getElementById('chumMortsRecap').value,
      'Coho Fry': document.getElementById('cohoFryCaught').value,
      'Coho Smolt': document.getElementById('cohoSmoltCaught').value,
      'Coho Smolt Marked':
        document.getElementById('cohoSmoltMarked').value,
      'Coho Smolt Recap': document.getElementById(
        'cohoSmoltMarkedRecap',
      ).value,
      'Coho Fry Mort': document.getElementById('cohoFryMorts').value,
      'Coho Smolt Mort':
        document.getElementById('cohoSmoltMorts').value,
      'Coho Smolt Mort Marked': document.getElementById(
        'cohoSmoltMortsMarked',
      ).value,
      'Coho Smolt Mort Recap': document.getElementById(
        'cohoSmoltMortsRecap',
      ).value,
      'Coho Parr': document.getElementById('cohoParrCaught').value,
      Steelhead: document.getElementById('steelheadCaught').value,
      'Steelhead Marked':
        document.getElementById('steelheadMarked').value,
      'Steelhead Recap': document.getElementById(
        'steelheadMarkedRecap',
      ).value,
      'Coho Parr Mort':
        document.getElementById('cohoParrMorts').value,
      'Steelhead Mort':
        document.getElementById('steelheadMorts').value,
      'Steelhead Mort Marked': document.getElementById(
        'steelheadMortsMarked',
      ).value,
      'Steelhead Mort Recap': document.getElementById(
        'steelheadMortsRecap',
      ).value,
      Cutthroat: document.getElementById('cutthroatCaught').value,
      Chinook: document.getElementById('chinookCaught').value,
      Sculpin: document.getElementById('sculpinCaught').value,
      Lamprey: document.getElementById('lampreyCaught').value,
      'Cutthroat Mort':
        document.getElementById('cutthroatMorts').value,
      'Chinook Mort': document.getElementById('chinookMorts').value,
      'Sculpin Mort': document.getElementById('sculpinMorts').value,
      'Lamprey Mort': document.getElementById('lampreyMorts').value,
      Comments: document.getElementById('comments').value,
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
              `HTTP error! <br> status: ${response.status} - ${data.message || data.error}`,
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('Success response:', data);
        openModal(data.message, true);
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        openModal(
          `Error submitting the form: <br> ${error.message}`,
          false,
        );
      });
  });
});
