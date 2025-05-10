const Tag = require('../models/Tag');
const slugs = require("../utils/slugs")


const createTag = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Tag name is required.' });
        }

        const generatedSlug = slugs(name.toLowerCase());

        // Check if tag already exists
        const existingTag = await Tag.findOne({ slug: generatedSlug });
        if (existingTag) {
            return res.status(400).json({ success: false, message: 'Tag already exists.' });
        }

        const tag = new Tag({
            name,
            slug: generatedSlug,
        });

        await tag.save();

        res.status(201).json({
            success: true,
            message: 'Tag created successfully.',
            tag,
        });

    } catch (error) {
        console.error('Error creating tag:', error);
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
};


const getAllTags = async (req, res) => {
    try {
        const tags = await Tag.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Tags fetched successfully.',
            tags,
        });

    } catch (error) {
        console.error('Error fetching Tags:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: error.message,
        });
    }
};


const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;

        const tag = await Tag.findById(id);

        if (!tag) {
            return res.status(404).json({
                success: false,
                message: 'tag not found.',
            });
        }

        await Tag.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Tag deleted successfully.',
        });

    } catch (error) {
        console.error('Error deleting Tag:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: error.message,
        });
    }
};



module.exports = {
    createTag,
    getAllTags,
    deleteTag,
};
