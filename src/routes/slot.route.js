const express = require('express');
const router = express.Router();
const SlotController = require('../controller/slot.controller');
const jwtAuth = require('../middleware/jwt-middleware');
const {checkCategoryUser,checkCategoryExpert,validateRequest} = require('../middleware/validator.middleware');
const {upsertSlotServiceSchema, getSlotsServiceSchema} = require('../middleware/slot.middleware')

router.post('/upsert/slot/v1',validateRequest(upsertSlotServiceSchema),jwtAuth.verifyJwtTokentoNext,checkCategoryExpert, SlotController.UpsertSlotController);
router.post('/get/slot/v1',validateRequest(getSlotsServiceSchema),jwtAuth.verifyJwtTokentoNext, checkCategoryExpert, SlotController.getSlotsController);


module.exports = router;