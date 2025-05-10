const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).send({ message: "Name, email, and password are required" });
        }

        let existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).send({ message: "User already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        })

        await newUser.save()

        res.status(200).send({
            sucess: true,
            message: "User registered successfully",
            user: newUser
        });
    } catch (error) {
        console.log(error)
        res.status(500).send({ sucess: false, message: "Failed to register user", error: error.message });
    }
}


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({ message: "Both email and password are required" });
        }

        const checkUser = await User.findOne({ email });
        if (!checkUser) {
            return res.status(401).send({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, checkUser.password);
        if (!isPasswordValid) {
            return res.status(401).send({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: checkUser._id, email: checkUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "12h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
        });

        return res.status(200).send({
            success: true,
            message: "Login successful",
            token,
            user: {
                userId: checkUser._id,
                name: checkUser.name,
                email: checkUser.email,
                role: checkUser.role,
            }
        });

    } catch (error) {
        console.error("Login Error:", error.message);
        return res.status(500).send({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
}


const logoutUser = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
        });

        return res.status(200).send({
            success: true,
            message: 'Logout successful',
        });

    } catch (error) {
        console.error("Logout Error:", error.message);
        return res.status(500).send({
            success: false,
            message: 'Logout failed',
            error: error.message,
        });
    }
};


const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).send({
            message: 'Users fetched successfully.',
            users,
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send({ message: 'Server error. Please try again later.' });
    }
};


const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        res.status(200).send({
            message: 'User fetched successfully.',
            user,
        });

    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).send({ message: 'Server error. Please try again later.' });
    }
};


const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).send({ message: 'Invalid status. Status must be "active" or "inactive".' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        user.status = status;
        await user.save();

        res.status(200).send({
            message: `User status updated to ${status}.`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                status: user.status,
            },
        });

    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).send({ message: 'Server error. Please try again later.' });
    }
};


const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || !['user', 'author', 'admin'].includes(role)) {
            return res.status(400).send({ message: 'Invalid role. Role must be user, author or admin.' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        user.role = role;
        await user.save();

        res.status(200).send({
            message: `User role updated to ${role}.`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).send({ message: 'Server error. Please try again later.' });
    }
};


const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        res.status(200).send({
            message: 'User deleted successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send({ message: 'Server error. Please try again later.' });
    }
};


const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        res.status(200).send({
            message: 'User fetched successfully.',
            user,
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send({ message: 'Server error. Please try again later.' });
    }
};




module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateUserStatus,
    deleteUser,
    updateUserRole,
    getAllUsers,
    getUserById,
}