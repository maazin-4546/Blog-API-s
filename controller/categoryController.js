const Category = require('../models/Category');
const { sendSuccess } = require('../utils/responseService');
const slugs = require("../utils/slugs")


const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required.' });
        }

        const generatedSlug = slugs(name.toLowerCase());

        // Check if category already exists
        const existingCategory = await Category.findOne({ slug: generatedSlug });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: 'Category already exists.' });
        }

        const category = new Category({
            name,
            slug: generatedSlug,
        });

        await category.save();
        sendSuccess(res, 200, req.t('category_created_successfully'), category);

    } catch (error) {
        console.error('Error creating category:', error);
        sendError(res, req.t('category_creation_failed'), error);
    }
};


const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });

        sendSuccess(res, 200, req.t('categories_fetched_successfully'), categories);

    } catch (error) {
        console.error('Error fetching categories:', error);
        sendError(res, req.t('Server error. Please try again later.'), error);
    }
};


const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found.',
            });
        }

        await Category.findByIdAndDelete(id);
        sendSuccess(res, 200, req.t('category_deleted_successfully'));


    } catch (error) {
        console.error('Error deleting category:', error);
        sendError(res, req.t('category_deletion_failed'), error);
    }
};




module.exports = {
    createCategory,
    getAllCategories,
    deleteCategory,
};
