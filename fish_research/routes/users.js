const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');
const { ensureAuthenticated } = require('../middleware/auth');

// protect all routes
router.use(ensureAuthenticated);

// api endpoints
router.post('/', userController.create);
router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

module.exports = router;
