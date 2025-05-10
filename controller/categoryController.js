const Category = require('../models/Category');
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

        res.status(201).json({
            success: true,
            message: 'Category created successfully.',
            category,
        });

    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
};


const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Categories fetched successfully.',
            categories,
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: error.message,
        });
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

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully.',
        });

    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: error.message,
        });
    }
};




module.exports = {
    createCategory,
    getAllCategories,
    deleteCategory,
};
