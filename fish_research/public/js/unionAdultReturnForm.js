document.addEventListener('DOMContentLoaded', function () {
  const unionAdultReturnForm = document.getElementById(
    'unionAdultReturnForm',
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
    responseMessage.textContent = message;
    responseMessage.className = isSuccess ? 'success' : 'error';
    responseModal.classList.remove('hidden');
  }

  // set max date for "Date" field to today, adjusting for timezone to ensure it works correctly regardless of user's local time
  const dateInput = document.getElementById('date');
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  const localToday = new Date(today.getTime() - timezoneOffset);
  dateInput.max = localToday.toISOString().split('T')[0];

  unionAdultReturnForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const trapOperatingRadio = document.querySelector(
      'input[name="Trap Operating"]:checked',
    );

    const formData = {
      Time: document.getElementById('time').value,
      'Trap Operating': trapOperatingRadio
        ? trapOperatingRadio.value
        : '',
      Date: document.getElementById('date').value,
      'Number of Visitors': document.getElementById(
        'numberOfVisitors',
      ).value,
      'Chum Males': document.getElementById('chumMales').value,
      'Chum Females': document.getElementById('chumFemales').value,
      'Coho Males - Adipose Present': document.getElementById(
        'cohoMalesAdiposePresent',
      ).value,
      'Coho Females - Adipose Present': document.getElementById(
        'cohoFemalesAdiposePresent',
      ).value,
      'Coho Males - Adipose Absent': document.getElementById(
        'cohoMalesAdiposeAbsent',
      ).value,
      'Coho Females - Adipose Absent': document.getElementById(
        'cohoFemalesAdiposeAbsent',
      ).value,
      'Chinook Males - Adipose Present': document.getElementById(
        'chinookMalesAdiposePresent',
      ).value,
      'Chinook Females - Adipose Present': document.getElementById(
        'chinookFemalesAdiposePresent',
      ).value,
      'Chinook Males - Adipose Absent': document.getElementById(
        'chinookMalesAdiposeAbsent',
      ).value,
      'Chinook Females - Adipose Absent': document.getElementById(
        'chinookFemalesAdiposeAbsent',
      ).value,
      'Pink Males': document.getElementById('pinkMales').value,
      'Pink Females': document.getElementById('pinkFemales').value,
      Comments: document.getElementById('comments').value,
    };

    // show loading state
    openModal('Submitting...', null);

    fetch('/api/Union_Adult_Return', {
      method: 'POST',
      credentials: 'same-origin',
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
        console.log('Success response data:', data);
        openModal(data.message, true);
        unionAdultReturnForm.reset();
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        openModal(
          `Error submitting the form: ${error.message}`,
          false,
        );
      });
  });
});
