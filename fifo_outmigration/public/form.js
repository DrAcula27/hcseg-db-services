document.addEventListener('DOMContentLoaded', function () {
  const trapSampleForm = document.getElementById('trapSampleForm');
  const responseMessage = document.getElementById('responseMessage');

  trapSampleForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const trapOperating =
      document.getElementById('trapOperating').value;
    const rpm = document.getElementById('rpm').value;
    const debris = document.getElementById('debris-select').value;
    const visibility = document.getElementById(
      'visibility-select'
    ).value;
    const flow = document.getElementById('flow-select').value;
    const waterTemp = document.getElementById('waterTemp').value;
    const hoboTemp = document.getElementById('hoboTemp').value;
    const chumFry = document.getElementById('chumFry').value;
    const chumFryMort = document.getElementById('chumFryMort').value;
    const chumAlevin = document.getElementById('chumAlevin').value;
    const chumDNATaken =
      document.getElementById('chumDNATaken').value;
    const chumDNAIDs = document.getElementById('chumDNAIDs').value;
    const chumMarked = document.getElementById('chumMarked').value;
    const markedChumReleased = document.getElementById(
      'markedChumReleased'
    ).value;
    const markedChumRecap =
      document.getElementById('markedChumRecap').value;
    const markedChumMort =
      document.getElementById('markedChumMort').value;
    const cohoFry = document.getElementById('cohoFry').value;
    const cohoParr = document.getElementById('cohoParr').value;
    const cohoMarked = document.getElementById('cohoMarked').value;
    const markedCohoRecap =
      document.getElementById('markedCohoRecap').value;
    const chinookFry = document.getElementById('chinookFry').value;
    const chinookParr = document.getElementById('chinookParr').value;
    const pinkFry = document.getElementById('pinkFry').value;
    const sculpin = document.getElementById('sculpin').value;
    const cutthroat = document.getElementById('cutthroat').value;
    const steelhead = document.getElementById('steelhead').value;
    const lamprey = document.getElementById('lamprey').value;
    const stickleback = document.getElementById('stickleback').value;
    const comments = document.getElementById('comments').value;

    // const formData = new FormData(trapSampleForm);
    const formData = {
      date,
      time,
      trapOperating,
      rpm,
      debris,
      visibility,
      flow,
      waterTemp,
      hoboTemp,
      chumFry,
      chumFryMort,
      chumAlevin,
      chumDNATaken,
      chumDNAIDs,
      chumMarked,
      markedChumReleased,
      markedChumRecap,
      markedChumMort,
      cohoFry,
      cohoParr,
      cohoMarked,
      markedCohoRecap,
      chinookFry,
      chinookParr,
      pinkFry,
      sculpin,
      cutthroat,
      steelhead,
      lamprey,
      stickleback,
      comments,
    };

    const apiEndpoint = 'https://localhost:3000/api/trap-sample';

    fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        responseMessage.innerHTML = `<p>${data.message}</p>`;
        responseMessage.classList.add('success', 'show');

        // setTimeout(() => {
        //   trapSampleForm.reset();
        //   responseMessage.innerHTML = '';
        //   responseMessage.classList.remove('success', 'show');
        // }, 2000);
      })
      .catch((error) => {
        console.error('Error:', error);
        responseMessage.innerHTML = `<p>Error submitting the form. Please try again later.</p>`;
        responseMessage.classList.add('error', 'show');

        // setTimeout(() => {
        //   responseMessage.innerHTML = '';
        //   responseMessage.classList.remove('error', 'show');
        // }, 3000);
      });
  });
});
