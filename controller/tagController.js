const Tag = require('../models/Tag');
const { sendError, sendSuccess } = require('../utils/responseService');
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

        sendSuccess(res, 200, req.t('tag_created_successfully'), blogs);

    } catch (error) {
        console.error('Error creating tag:', error);
        sendError(res, req.t('tag_creation_failed'), error);
    }
};


const getAllTags = async (req, res) => {
    try {
        const tags = await Tag.find().sort({ createdAt: -1 });
        sendSuccess(res, 200, req.t('tags_fetched_successfully'), tags);

    } catch (error) {
        console.error('Error fetching Tags:', error);
        sendError(res, req.t('Server error. Please try again later.'), error);
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

        sendSuccess(res, 200, req.t('tag_deleted_successfully'));

    } catch (error) {
        console.error('Error deleting Tag:', error);
        sendError(res, req.t('tag_deletion_failed'), error);
    }
};



module.exports = {
    createTag,
    getAllTags,
    deleteTag,
};
