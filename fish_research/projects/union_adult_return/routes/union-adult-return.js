const express = require('express');
const router = express.Router();
const unionAdultReturnController = require('../controllers/union-adult-return.js');
const { ensureAuthenticated } = require('../../../middleware/auth');

// protect all routes
router.use(ensureAuthenticated);

// api endpoints
router.post('/', unionAdultReturnController.create);
router.get('/', unionAdultReturnController.getAll);
router.get('/:id', unionAdultReturnController.getById);
router.put('/:id', unionAdultReturnController.update);
router.delete('/:id', unionAdultReturnController.delete);

module.exports = router;
