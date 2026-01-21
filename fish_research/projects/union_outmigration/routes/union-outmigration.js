const express = require('express');
const router = express.Router();
const unionOutmigrationController = require('../controllers/union-outmigration.js');
const { ensureAuthenticated } = require('../../../middleware/auth');

// protect all routes
router.use(ensureAuthenticated);

// api endpoints
router.post('/', unionOutmigrationController.create);
router.get('/', unionOutmigrationController.getAll);
router.get('/:id', unionOutmigrationController.getById);
router.put('/:id', unionOutmigrationController.update);
router.delete('/:id', unionOutmigrationController.delete);

module.exports = router;
