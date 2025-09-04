const mongoose = require("mongoose");
const Review = require("../models/review");
const ReviewVote = require("../models/reviewVote");
const Product = require("../models/product");
const Order = require("../models/order");
const { logger } = require("../utils/logger");
const Admin = require('../models/admin');

// Create a new review
exports.createReview = async (req, res) => {
  const { productId, userId, rating, title, comment } = req.body;

  logger.info("Received createReview request", { productId, userId, rating });

  if (!productId || !userId || !rating || !comment) {
    logger.warn("Missing required fields in createReview request", { body: req.body });
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (rating < 1 || rating > 5) {
    logger.warn("Invalid rating value", { rating });
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  if (comment.trim().length < 10) {
    logger.warn("Comment too short", { commentLength: comment.length });
    return res.status(400).json({ message: "Comment must be at least 10 characters long" });
  }

  try {
    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      userId,
      productId,
      deleted_at: null
    });

    if (existingReview) {
      logger.warn("User already reviewed this product", { userId, productId });
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    // Check if user purchased this product
    const purchaseVerified = await checkPurchaseVerification(userId, productId);

    const reviewData = {
      productId,
      userId,
      rating,
      title: title?.trim() || undefined,
      comment: comment.trim(),
      isVerifiedPurchase: purchaseVerified,
    };

    const newReview = new Review(reviewData);
    await newReview.save();

    logger.info("Calling updateProductRating for productId", { productId });
    // Update product average rating
    await updateProductRating(productId);

    // Populate user info for response
    const populatedReview = await Review.findById(newReview._id)
      .populate('userId', 'name email');

    logger.info("Review created successfully", { reviewId: newReview._id, productId });

    res.status(201).json({
      message: "Review submitted successfully",
      review: populatedReview
    });
  } catch (error) {
    logger.error("Error creating review", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// option1: Get only approved reviews for a product
exports.getProductReviews = async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sortBy = 'newest', filterBy = 'all' } = req.query;

  logger.info("Received getProductReviews request", { productId, page, sortBy, filterBy });

  try {
    // Build sort object
    let sort = { createdAt: -1 };

    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'highest':
        sort = { rating: -1, createdAt: -1 };
        break;
      case 'lowest':
        sort = { rating: 1, createdAt: -1 };
        break;
      case 'helpful':
        sort = { helpfulVotes: -1, createdAt: -1 };
        break;
    }

    // Build filter object
    let filter = {
      productId,
      isApproved: true,
      deleted_at: null
    };

    if (filterBy === 'verified') {
      filter.isVerifiedPurchase = true;
    } else if (filterBy !== 'all' && !isNaN(filterBy)) {
      filter.rating = parseInt(filterBy);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(filter)
      .populate('userId', 'name')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const totalReviews = await Review.countDocuments(filter);

    logger.info("Fetched product reviews", {
      productId,
      reviewCount: reviews.length,
      totalReviews
    });

    res.status(200).json({
      reviews,
      pagination: {
        total: totalReviews,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalReviews / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error("Error fetching product reviews", {
      error: error.message,
      stack: error.stack,
      productId
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// option 2: Get all reviews (approved + unapproved) for a product
// Get reviews for a product (including approved and unapproved)
// exports.getProductReviews = async (req, res) => {
//   const { productId } = req.params;
//   const { page = 1, limit = 10, sortBy = 'newest', filterBy = 'all' } = req.query;

//   logger.info("Received getProductReviews request", { productId, page, sortBy, filterBy });

//   try {
//     // Build sort object
//     let sort = { createdAt: -1 };

//     switch (sortBy) {
//       case 'oldest':
//         sort = { createdAt: 1 };
//         break;
//       case 'highest':
//         sort = { rating: -1, createdAt: -1 };
//         break;
//       case 'lowest':
//         sort = { rating: 1, createdAt: -1 };
//         break;
//       case 'helpful':
//         sort = { helpfulVotes: -1, createdAt: -1 };
//         break;
//     }

//     // Build filter object to include all reviews (approved or not)
//     let filter = { productId, deleted_at: null };

//     if (filterBy === 'verified') {
//       filter.isVerifiedPurchase = true;
//     } else if (filterBy !== 'all' && !isNaN(filterBy)) {
//       filter.rating = parseInt(filterBy);
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const reviews = await Review.find(filter)
//       .populate('userId', 'name')
//       .sort(sort)
//       .limit(parseInt(limit))
//       .skip(skip);

//     const totalReviews = await Review.countDocuments(filter);

//     logger.info("Fetched product reviews", {
//       productId,
//       reviewCount: reviews.length,
//       totalReviews
//     });

//     res.status(200).json({
//       reviews,
//       pagination: {
//         total: totalReviews,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         totalPages: Math.ceil(totalReviews / parseInt(limit))
//       }
//     });
//   } catch (error) {
//     logger.error("Error fetching product reviews", {
//       error: error.message,
//       stack: error.stack,
//       productId
//     });
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// option 3: Get all approved reviews for a product
// Example backend code to fetch reviews for a product
// app.get('/api/review/product/:productId', async (req, res) => {
//   const { productId } = req.params; // Make sure productId is coming from the URL parameters

//   if (!mongoose.Types.ObjectId.isValid(productId)) {
//     return res.status(400).json({ message: "Invalid productId" });
//   }

//   try {
//     const reviews = await Review.find({ productId: mongoose.Types.ObjectId(productId) });
//     const totalReviews = reviews.length;

//     res.status(200).json({
//       reviews,
//       pagination: {
//         total: totalReviews,
//         page: 1, // Adjust based on your pagination logic
//         limit: 10,
//         totalPages: Math.ceil(totalReviews / 10),
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });




// Get review statistics for a product
exports.getProductReviewStats = async (req, res) => {
  const { productId } = req.params;

  logger.info("Received getProductReviewStats request", { productId });

  try {
    // Get rating distribution
    const ratingStats = await Review.aggregate([
      {
        $match: {
          productId: mongoose.Types.ObjectId(productId),
          isApproved: true,
          deleted_at: null
        }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total reviews and average rating
    const totalReviews = await Review.countDocuments({
      productId,
      isApproved: true,
      deleted_at: null
    });

    const averageRatingResult = await Review.aggregate([
      {
        $match: {
          productId: mongoose.Types.ObjectId(productId),
          isApproved: true,
          deleted_at: null
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' }
        }
      }
    ]);

    // Build rating distribution
    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = 0;
    }

    ratingStats.forEach(stat => {
      ratingDistribution[stat._id] = stat.count;
    });

    // option 1: aggrigation result is an array, so we need to extract from first item
    // const averageRating = averageRatingResult[0]?.average || 0;

    //  option 2: simplified aggrigation
    const [avg] = await Review.aggregate([
      { $match: { productId: mongoose.Types.ObjectId(productId), isApproved: true, deleted_at: null } },
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);

    const averageRating = avg?.average || 0;


    logger.info("Fetched product review stats", {
      productId,
      totalReviews,
      averageRating: averageRating.toFixed(1)
    });

    res.status(200).json({
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      ratingDistribution
    });
  } catch (error) {
    logger.error("Error fetching product review stats", {
      error: error.message,
      stack: error.stack,
      productId
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Vote on review helpfulness
exports.voteReview = async (req, res) => {
  const { reviewId } = req.params;
  const { userId, isHelpful } = req.body;

  logger.info("Received voteReview request", { reviewId, userId, isHelpful });

  if (!userId || typeof isHelpful !== 'boolean') {
    logger.warn("Missing required fields in voteReview request", { body: req.body });
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if user already voted on this review
    const existingVote = await ReviewVote.findOne({ userId, reviewId });

    if (existingVote) {
      // Update existing vote
      existingVote.isHelpful = isHelpful;
      await existingVote.save();
      logger.info("Updated existing vote", { reviewId, userId, isHelpful });
    } else {
      // Create new vote
      const newVote = new ReviewVote({
        userId,
        reviewId,
        isHelpful
      });
      await newVote.save();
      logger.info("Created new vote", { reviewId, userId, isHelpful });
    }

    // Update review vote counts
    await updateReviewVoteCounts(reviewId);

    res.status(200).json({ message: "Vote recorded successfully" });
  } catch (error) {
    logger.error("Error voting on review", {
      error: error.message,
      stack: error.stack,
      reviewId
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user's review
exports.updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { userId, rating, title, comment } = req.body;

  logger.info("Received updateReview request", { reviewId, userId });

  if (!userId || !rating || !comment) {
    logger.warn("Missing required fields in updateReview request", { body: req.body });
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (rating < 1 || rating > 5) {
    logger.warn("Invalid rating value", { rating });
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    const review = await Review.findOne({
      _id: reviewId,
      userId,
      deleted_at: null
    });

    if (!review) {
      logger.warn("Review not found or access denied", { reviewId, userId });
      return res.status(404).json({
        message: "Review not found or you do not have permission to edit it"
      });
    }

    // Update review
    review.rating = rating;
    review.title = title?.trim() || undefined;
    review.comment = comment.trim();
    review.updatedAt = new Date();

    await review.save();

    // Update product average rating
    await updateProductRating(review.productId);

    // Populate user info for response
    const updatedReview = await Review.findById(review._id)
      .populate('userId', 'name');

    logger.info("Review updated successfully", { reviewId });

    res.status(200).json({
      message: "Review updated successfully",
      review: updatedReview
    });
  } catch (error) {
    logger.error("Error updating review", {
      error: error.message,
      stack: error.stack,
      reviewId
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete user's review (soft delete)
exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const { userId } = req.body;

  logger.info("Received deleteReview request", { reviewId, userId });

  if (!userId) {
    logger.warn("Missing userId in deleteReview request", { body: req.body });
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const review = await Review.findOne({
      _id: reviewId,
      userId,
      deleted_at: null
    });

    if (!review) {
      logger.warn("Review not found or access denied", { reviewId, userId });
      return res.status(404).json({
        message: "Review not found or you do not have permission to delete it"
      });
    }

    const productId = review.productId;

    // Soft delete review
    review.deleted_at = new Date();
    await review.save();

    // Delete associated votes
    await ReviewVote.deleteMany({ reviewId });

    // Update product average rating
    await updateProductRating(productId);

    logger.info("Review deleted successfully", { reviewId });

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    logger.error("Error deleting review", {
      error: error.message,
      stack: error.stack,
      reviewId
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Report a review
exports.reportReview = async (req, res) => {
  const { reviewId } = req.params;
  const { userId } = req.body;

  logger.info("Received reportReview request", { reviewId, userId });

  if (!userId) {
    logger.warn("Missing userId in reportReview request", { body: req.body });
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const review = await Review.findOne({
      _id: reviewId,
      deleted_at: null
    });

    if (!review) {
      logger.warn("Review not found", { reviewId });
      return res.status(404).json({ message: "Review not found" });
    }

    // Update report count
    review.reportCount += 1;
    review.isReported = true;

    // Auto-hide review if too many reports
    if (review.reportCount >= 5) {
      review.isApproved = false;
      logger.info("Review auto-hidden due to reports", { reviewId, reportCount: review.reportCount });
    }

    await review.save();

    logger.info("Review reported successfully", { reviewId });

    res.status(200).json({ message: "Review reported successfully" });
  } catch (error) {
    logger.error("Error reporting review", {
      error: error.message,
      stack: error.stack,
      reviewId
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Check if user can review product (purchase verification)
exports.checkPurchaseVerification = async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.query;

  logger.info("Received checkPurchaseVerification request", { productId, userId });

  if (!userId) {
    logger.warn("Missing userId in checkPurchaseVerification request");
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const isVerified = await checkPurchaseVerification(userId, productId);

    logger.info("Purchase verification checked", { productId, userId, isVerified });

    res.status(200).json({
      isVerified,
      canReview: true
    });
  } catch (error) {
    logger.error("Error checking purchase verification", {
      error: error.message,
      stack: error.stack,
      productId,
      userId
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user's reviews
exports.getUserReviews = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  logger.info("Received getUserReviews request", { userId, page });

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({
      userId,
      deleted_at: null
    })
      .populate('productId', 'name media')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalReviews = await Review.countDocuments({
      userId,
      deleted_at: null
    });

    logger.info("Fetched user reviews", { userId, reviewCount: reviews.length });

    res.status(200).json({
      reviews,
      pagination: {
        total: totalReviews,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalReviews / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error("Error fetching user reviews", {
      error: error.message,
      stack: error.stack,
      userId
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function: Check if user purchased product
const checkPurchaseVerification = async (userId, productId) => {
  try {
    const order = await Order.findOne({
      userId,
      status: { $in: ['completed', 'delivered', 'Completed', 'Delivered'] }, // adjust based on your order statuses
      'items.productId': productId
    });

    return !!order;
  } catch (error) {
    logger.error("Error in purchase verification", { error: error.message, userId, productId });
    return false;
  }
};

// Helper function: Update product average rating

// const updateProductRating = async (productId) => {
//   try {
//     const stats = await Review.aggregate([
//       {
//         $match: {
//           productId: mongoose.Types.ObjectId(productId),
//           isApproved: true,
//           deleted_at: null
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           averageRating: { $avg: '$rating' },
//           totalReviews: { $sum: 1 }
//         }
//       }
//     ]);
//     // Always extract from the FIRST ITEM of stats array
//     const { averageRating = 0, totalReviews = 0 } = stats[0] || {};
//     await Product.findByIdAndUpdate(productId, {
//       averageRating: parseFloat((averageRating || 0).toFixed(1)),
//       totalReviews
//     });
//     logger.info("Product rating updated", { productId, averageRating, totalReviews });
//   } catch (error) {
//     logger.error("Error updating product rating", { error: error.message, productId });
//   }
// };

const updateProductRating = async (productId) => {
  try {
    // Aggregate the ratings
    // const stats = await Review.aggregate([
    //   { $match: { productId: mongoose.Types.ObjectId(productId), isApproved: true, deleted_at: null } },
    //   { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
    // ]);

    // console.log("Product stats:", stats);


    const stats = await Review.aggregate([
      { $match: { productId: mongoose.Types.ObjectId(productId), isApproved: true, deleted_at: null } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    console.log("Aggregation result:", stats);


    const averageRating = stats[0]?.average || 0;
    const totalReviews = stats[0]?.count || 0;

    // Update the product with the new ratings
    await Product.findByIdAndUpdate(productId, {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: totalReviews
    });

    logger.info("Product rating updated", { productId, averageRating, totalReviews });
  } catch (error) {
    logger.error("Error updating product rating", { error: error.message, productId });
  }
};



// Helper function: Update review vote counts
const updateReviewVoteCounts = async (reviewId) => {
  try {
    const helpfulVotes = await ReviewVote.countDocuments({
      reviewId,
      isHelpful: true
    });

    const totalVotes = await ReviewVote.countDocuments({ reviewId });

    await Review.findByIdAndUpdate(reviewId, {
      helpfulVotes,
      totalVotes
    });

    logger.info("Review vote counts updated", { reviewId, helpfulVotes, totalVotes });
  } catch (error) {
    logger.error("Error updating review vote counts", { error: error.message, reviewId });
  }
};

// API test route
exports.testAPI = (req, res) => {
  res.send("Review API Working");
};
