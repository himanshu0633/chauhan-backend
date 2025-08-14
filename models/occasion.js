const mongoose = require("mongoose");

const occasionSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        image: { type: String },
        deleted_at: { type: Date, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Occasion", occasionSchema);
