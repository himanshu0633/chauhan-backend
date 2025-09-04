const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { logger } = require("../utils/logger");

// Create Review Route
router.post('/createReview', reviewController.createReview);

// Get Reviews by Product ID
router.get('/product/:productId', reviewController.getProductReviews);

// Get Review Statistics for Product
router.get('/product/:productId/stats', reviewController.getProductReviewStats);

// Vote on Review
router.post('/vote/:reviewId', reviewController.voteReview);

// Update Review
router.put('/update/:reviewId', reviewController.updateReview);

// Delete Review (Soft Delete)
router.delete('/delete/:reviewId', reviewController.deleteReview);

// Report Review
router.post('/report/:reviewId', reviewController.reportReview);

// Check Purchase Verification
router.get('/verify-purchase/:productId', reviewController.checkPurchaseVerification);

// Get User Reviews
router.get('/user/:userId', reviewController.getUserReviews);

// Test route
router.get('/', reviewController.testAPI);

module.exports = router;
