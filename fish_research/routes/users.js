const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');
const { ensureAuthenticated } = require('../middleware/auth');

// protect all routes
router.use(ensureAuthenticated);

// api endpoints
router.get('/:id', userController.getById);
router.get('/', userController.getAll);
router.post('/', userController.create);
router.delete('/:id', userController.delete);
router.put('/:id', userController.update);

module.exports = router;
