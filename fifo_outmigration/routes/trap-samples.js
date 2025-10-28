const express = require('express');
const router = express.Router();
const trapSamplesController = require('../controllers/trap-samples.js');

router.post('/trap-sample', trapSamplesController.submitForm);

module.exports = router;
