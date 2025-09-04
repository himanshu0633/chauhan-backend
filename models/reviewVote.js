const mongoose = require("mongoose");

const reviewVoteSchema = mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Review',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Admin',
    },
    isHelpful: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

// Compound unique index
reviewVoteSchema.index({ userId: 1, reviewId: 1 }, { unique: true });

module.exports = mongoose.model("ReviewVote", reviewVoteSchema);
