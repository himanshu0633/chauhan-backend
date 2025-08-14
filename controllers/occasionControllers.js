const Occasion = require("../models/occasion");
const { logger } = require("../utils/logger");

// Create a new Occasion

// Create a new Occasion with image
exports.createOccasion = async (req, res) => {
    try {
        const imagePath = req.file ? req.file.path : null;

        const occasion = new Occasion({
            ...req.body,
            image: imagePath,
        });

        const savedOccasion = await occasion.save();
        res.status(201).json(savedOccasion);
    } catch (error) {
        console.error("Error creating Occasion:", error);
        res.status(400).json({ message: error.message });
    }
};

// Update a Occasion (including image)
exports.updateOccasion = async (req, res) => {
    try {
        const imagePath = req.file ? req.file.path : undefined;

        const updateData = {
            ...req.body,
            updatedAt: Date.now(),
        };

        if (imagePath) {
            updateData.image = imagePath;
        }

        const updatedOccasion = await Occasion.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedOccasion) {
            logger.warn(`Occasion not found for update: ${req.params.id}`);
            return res.status(404).json({ message: "Occasion not found" });
        }

        logger.info(`Occasion updated: ${updatedOccasion._id}`);
        res.status(200).json(updatedOccasion);
    } catch (error) {
        logger.error(`Error updating Occasion (${req.params.id}):`, error);
        res.status(400).json({ message: error.message });
    }
};


// Get all occasions
exports.getAllOccasions = async (req, res) => {
    try {
        const occasions = await Occasion.find({ deleted_at: null });

        logger.info(`Fetched ${occasions.length} occasions`);
        res.status(200).json(occasions);
    } catch (error) {
        logger.error("Error fetching all occasions:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get a single Occasion by ID
exports.getOccasionById = async (req, res) => {
    try {
        const Occasion = await Occasion.findOne({
            _id: req.params.id,
            deleted_at: null,
        });

        if (!Occasion) {
            logger.warn(`Occasion not found with ID: ${req.params.id}`);
            return res.status(404).json({ message: "Occasion not found" });
        }

        logger.info(`Occasion retrieved: ${Occasion._id}`);
        res.status(200).json(Occasion);
    } catch (error) {
        logger.error(`Error fetching Occasion by ID (${req.params.id}):`, error);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteOccasion = async (req, res) => {
    try {
        const deletedOccasion = await Occasion.findByIdAndUpdate(
            req.params.id,
            { deleted_at: new Date() },
            { new: true }
        );

        if (!deletedOccasion) {
            logger.warn(`Occasion not found for deletion: ${req.params.id}`);
            return res.status(404).json({ message: "Occasion not found" });
        }

        logger.info(`Occasion soft-deleted: ${deletedOccasion._id}`);
        res.status(200).json({ message: "Occasion deleted successfully" });
    } catch (error) {
        logger.error(`Error deleting Occasion (${req.params.id}):`, error);
        res.status(500).json({ message: error.message });
    }
};
