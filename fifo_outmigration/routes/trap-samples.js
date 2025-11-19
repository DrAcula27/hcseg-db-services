const express = require('express');
const router = express.Router();
const trapSamplesController = require('../controllers/trap-samples.js');
const { ensureAuthenticated } = require('../middleware/auth');

// protect all routes
router.use(ensureAuthenticated);

// api endpoints
router.post('/', trapSamplesController.create);
router.get('/', trapSamplesController.getAll);
router.get('/:id', trapSamplesController.getById);
router.put('/:id', trapSamplesController.update);
router.delete('/:id', trapSamplesController.delete);

module.exports = router;
