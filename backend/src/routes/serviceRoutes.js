const express = require('express');
const controller = require('../controllers/serviceController');

const router = express.Router();

router.post('/', controller.createService);
router.get('/', controller.getServices);
router.get('/:id', controller.getServiceById);
router.put('/:id', controller.updateService);
router.delete('/:id', controller.deleteService);

module.exports = router;
