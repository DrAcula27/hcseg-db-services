document.addEventListener('DOMContentLoaded', function () {
  const trapSampleForm = document.getElementById('trapSampleForm');
  const responseMessage = document.getElementById('responseMessage');

  trapSampleForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const trapOperatingRadio = document.querySelector(
      'input[name="trapOperating"]:checked'
    );

    const formData = {
      date: document.getElementById('date').value,
      time: document.getElementById('time').value,
      trapOperating: trapOperatingRadio
        ? trapOperatingRadio.value
        : '',
      rpm: document.getElementById('rpm').value,
      debris: document.getElementById('debris-select').value,
      visibility: document.getElementById('visibility-select').value,
      flow: document.getElementById('flow-select').value,
      waterTemp: document.getElementById('waterTemp').value,
      hoboTemp: document.getElementById('hoboTemp').value,
      chumFry: document.getElementById('chumFry').value,
      chumFryMort: document.getElementById('chumFryMort').value,
      chumAlevin: document.getElementById('chumAlevin').value,
      chumDNATaken: document.getElementById('chumDNATaken').value,
      chumDNAIDs: document.getElementById('chumDNAIDs').value,
      chumMarked: document.getElementById('chumMarked').value,
      markedChumReleased: document.getElementById(
        'markedChumReleased'
      ).value,
      markedChumRecap:
        document.getElementById('markedChumRecap').value,
      markedChumMort: document.getElementById('markedChumMort').value,
      cohoFry: document.getElementById('cohoFry').value,
      cohoSmolt: document.getElementById('cohoSmolt').value, // FIXED: was cohoParr in form
      cohoParr: document.getElementById('cohoParr').value,
      cohoMarked: document.getElementById('cohoMarked').value,
      markedCohoRecap:
        document.getElementById('markedCohoRecap').value,
      cohoFryMort: document.getElementById('cohoFryMort').value,
      cohoSmoltMort: document.getElementById('cohoSmoltMort').value,
      markedCohoMort: document.getElementById('markedCohoMort').value,
      recapCohoMort: document.getElementById('recapCohoMort').value,
      cohoParrMort: document.getElementById('cohoParrMort').value,
      chinookFry: document.getElementById('chinookFry').value,
      chinookParr: document.getElementById('chinookParr').value,
      chinookMort: document.getElementById('chinookMort').value,
      pinkFry: document.getElementById('pinkFry').value,
      sculpin: document.getElementById('sculpin').value,
      sculpinMort: document.getElementById('sculpinMort').value,
      cutthroat: document.getElementById('cutthroat').value,
      cutthroatMort: document.getElementById('cutthroatMort').value,
      steelhead: document.getElementById('steelhead').value,
      steelheadMarked:
        document.getElementById('steelheadMarked').value,
      markedSteelheadRecap: document.getElementById(
        'markedSteelheadRecap'
      ).value,
      steelheadMort: document.getElementById('steelheadMort').value,
      markedSteelheadMort: document.getElementById(
        'markedSteelheadMort'
      ).value,
      recapSteelheadMort: document.getElementById(
        'recapSteelheadMort'
      ).value,
      lamprey: document.getElementById('lamprey').value,
      lampreyMort: document.getElementById('lampreyMort').value,
      stickleback: document.getElementById('stickleback').value,
      comments: document.getElementById('comments').value,
    };

    const apiEndpoint = 'https://localhost:3000/api/trap-samples';

    // show loading state
    responseMessage.innerHTML = '<p>Submitting...</p>';
    responseMessage.classList.add('show');
    responseMessage.classList.remove('success', 'error');

    fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        responseMessage.innerHTML = `<p>${data.message}</p>`;
        responseMessage.classList.add('success', 'show');
        responseMessage.classList.remove('error');

        // setTimeout(() => {
        //   trapSampleForm.reset();
        //   responseMessage.innerHTML = '';
        //   responseMessage.classList.remove('success', 'show');
        // }, 3000);
      })
      .catch((error) => {
        console.error('Error:', error);
        responseMessage.innerHTML = `<p>Error submitting the form. Please try again later.</p>`;
        responseMessage.classList.add('error', 'show');
        responseMessage.classList.remove('success');

        // setTimeout(() => {
        //   responseMessage.innerHTML = '';
        //   responseMessage.classList.remove('error', 'show');
        // }, 5000);
      });
  });
});
