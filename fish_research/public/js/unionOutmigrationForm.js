document.addEventListener('DOMContentLoaded', function () {
  const unionOutmigrationForm = document.getElementById(
    'unionOutmigrationForm',
  );
  const responseMessage = document.getElementById('responseMessage');
  const responseModal = document.getElementById('responseModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalOverlay = responseModal.querySelector('.modal-overlay');

  // close modal when close button is clicked
  modalCloseBtn.addEventListener('click', closeModal);

  // close modal when clicking outside the modal content
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

  // close modal when enter key is pressed
  document.addEventListener('keydown', function (event) {
    if (
      event.key === 'Enter' &&
      !responseModal.classList.contains('hidden')
    ) {
      event.preventDefault();
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

  unionOutmigrationForm.addEventListener('submit', function (event) {
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
      Visibility: document.getElementById('visibility-select').value,
      Flow: document.getElementById('flow-select').value,
      'Water Temp': document.getElementById('waterTemp').value,
      'Hobo Temp': document.getElementById('hoboTemp').value,
      'Chum Fry': document.getElementById('chumFry').value,
      'Chum Fry Mort': document.getElementById('chumFryMort').value,
      'Chum DNA Taken': document.getElementById('chumDnaTaken').value,
      'Chum DNA IDs': document.getElementById('chumDnaIds').value,
      'Chum Marked': document.getElementById('chumMarked').value,
      'Chum Marked Mort':
        document.getElementById('chumMarkedMort').value,
      'Chum Recap': document.getElementById('chumRecap').value,
      'Chum Recap Mort':
        document.getElementById('chumRecapMort').value,
      'Coho Fry': document.getElementById('cohoFry').value,
      'Coho Fry Mort': document.getElementById('cohoFryMort').value,
      'Coho Parr': document.getElementById('cohoParr').value,
      'Coho Parr Mort': document.getElementById('cohoParrMort').value,
      'Coho Smolt': document.getElementById('cohoSmolt').value,
      'Coho Smolt Mort':
        document.getElementById('cohoSmoltMort').value,
      'Coho Smolt Marked':
        document.getElementById('cohoSmoltMarked').value,
      'Coho Smolt Marked Mort': document.getElementById(
        'cohoSmoltMarkedMort',
      ).value,
      'Coho Smolt Recap':
        document.getElementById('cohoSmoltRecap').value,
      'Coho Smolt Recap Mort': document.getElementById(
        'cohoSmoltRecapMort',
      ).value,
      Steelhead: document.getElementById('steelhead').value,
      'Steelhead Mort':
        document.getElementById('steelheadMort').value,
      'Steelhead Marked':
        document.getElementById('steelheadMarked').value,
      'Steelhead Marked Mort': document.getElementById(
        'steelheadMarkedMort',
      ).value,
      'Steelhead Recap':
        document.getElementById('steelheadRecap').value,
      'Steelhead Recap Mort': document.getElementById(
        'steelheadRecapMort',
      ).value,
      Cutthroat: document.getElementById('cutthroat').value,
      'Cutthroat Mort':
        document.getElementById('cutthroatMort').value,
      Chinook: document.getElementById('chinook').value,
      'Chinook Mort': document.getElementById('chinookMort').value,
      Sculpin: document.getElementById('sculpin').value,
      'Sculpin Mort': document.getElementById('sculpinMort').value,
      Lamprey: document.getElementById('lamprey').value,
      'Lamprey Mort': document.getElementById('lampreyMort').value,
      Comments: document.getElementById('comments').value,
    };

    // show loading state
    openModal('Submitting...', null);

    fetch('/api/Union_Outmigration', {
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
        unionOutmigrationForm.reset();
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
