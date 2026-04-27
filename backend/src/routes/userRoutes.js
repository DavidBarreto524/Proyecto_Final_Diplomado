const express = require('express');
const controller = require('../controllers/userController');

const router = express.Router();

router.post('/', controller.createUser);
router.get('/', controller.getUsers);
router.get('/:id', controller.getUserById);
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

module.exports = router;
