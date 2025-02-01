const express = require('express');
const router = express.Router();
const BookingController = require('../controller/booking.controller');
const jwtAuth = require('../middleware/jwt-middleware');
const {checkCategoryUser,checkCategoryExpert,validateRequest} = require('../middleware/validator.middleware');
const {upsertSlotBookingSchema, getUserBookingSchema, updateBookingStatusSchema} = require('../middleware/booking.middleware')

router.post('/slot/v1',validateRequest(upsertSlotBookingSchema),jwtAuth.verifyJwtTokentoNext, checkCategoryUser, BookingController.UpsertSlotBookingController);
router.post('/update/status/v1',validateRequest(updateBookingStatusSchema),jwtAuth.verifyJwtTokentoNext, checkCategoryExpert, BookingController.updateBookingStatusController);
router.get('/list/v1',validateRequest(getUserBookingSchema),jwtAuth.verifyJwtTokentoNext, checkCategoryUser, BookingController.getUserBookingController)

module.exports = router;