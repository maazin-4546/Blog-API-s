const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailerTransporter = require("../utils/nodeMailer");


const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).send({ message: "Name, email, and password are required" });
        }

        const existingUser = await User.findOne({ email });

        // --- RATE LIMITING LOGIC START ---
        if (existingUser) {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

            if (!existingUser.otpRequestHistory) {
                existingUser.otpRequestHistory = [];
            }

            // Filter out only the requests in the last 1 hour
            const recentOtpRequests = existingUser.otpRequestHistory.filter(
                (timestamp) => timestamp > oneHourAgo
            );

            if (recentOtpRequests.length >= 5) {
                return res.status(429).send({ message: "Too many OTP requests. Please try again after some time." });
            }

            existingUser.otpRequestHistory.push(new Date());
            await existingUser.save();
        }

        if (existingUser && existingUser.isEmailVerified) {
            return res.status(400).send({ message: "User already exist and is verified." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const emailVerificationOtpExpiry = new Date(Date.now() + 5 * 60 * 1000)

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create or update unverified user
        let user;
        if (existingUser) {
            user = await User.findByIdAndUpdate(existingUser._id, {
                name,
                password: hashedPassword,
                emailVerificationOtp: otp,
                emailVerificationOtpExpiry,
                otpRequestHistory: existingUser.otpRequestHistory, // update history
            }, { new: true })
        } else {
            user = new User({
                name,
                email,
                password: hashedPassword,
                emailVerificationOtp: otp,
                emailVerificationOtpExpiry,
                otpRequestHistory: [new Date()]
            })
            await user.save()
        }

        //! Nodemailer
        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "OTP Verification - Blog",
            text: `Your OTP for email verification is: ${otp}. It expires in 5 minutes.`
        }

        await nodemailerTransporter.sendMail(mailOptions)

        res.status(200).send({ success: true, message: "OTP sent to email successfully" });

    } catch (error) {
        console.log(error)
        res.status(500).send({ sucess: false, message: "Failed to register user", error: error.message });
    }
}


const verifyOtpAndRegister = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).send({ success: false, message: "Email and OTP are required." })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found." })
        }

        if (user.isEmailVerified) {
            return res.status(400).send({ message: "User already verified." });
        }

        if (user.emailVerificationOtp !== otp) {
            return res.status(400).send({ message: "Invalid OTP" });
        }

        if (new Date() > user.emailVerificationOtpExpiry) {
            return res.status(400).send({ message: "OTP expired" });
        }

        user.isEmailVerified = true;
        user.emailVerificationOtp = undefined;
        user.emailVerificationOtpExpiry = undefined;

        await user.save()

        res.status(200).send({
            success: true,
            message: "Email verified and user created successfully",
            user
        });

    } catch (error) {
        console.log("Error in register", error)
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
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
            sucess: true,
            message: 'Users fetched successfully.',
            users,
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(400).send({
            success: false,
            message: "Internal Server error",
            error: error.message
        })
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
            sucess: true,
            message: 'User fetched successfully.',
            user,
        });

    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(400).send({
            success: false,
            message: "Internal Server error",
            error: error.message
        })
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
            sucess: true,
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
        res.status(400).send({
            success: false,
            message: "Internal Server error",
            error: error.message
        })
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
            sucess: true,
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
        res.status(400).send({
            success: false,
            message: "Internal Server error",
            error: error.message
        })
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
            success: true,
            message: 'User deleted successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(400).send({
            success: false,
            message: "Internal Server error",
            error: error.message
        })
    };
}


const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        res.status(200).send({
            sucess: true,
            message: 'User fetched successfully.',
            user,
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(400).send({
            success: false,
            message: "Internal Server error",
            error: error.message
        })
    }
};


const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        // Prevent users from updating the role
        if ('role' in req.body) {
            delete req.body.role;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            req.body,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        res.status(200).send({
            success: true,
            message: 'Profile updated successfully.',
            user,
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(400).send({
            success: false,
            message: "Internal Server error",
            error: error.message
        })
    }
};


const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email })

        if (user) {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

            if (!user.otpRequestHistory) {
                user.otpRequestHistory = [];
            }

            // Filter out only the requests in the last 1 hour
            const recentOtpRequests = user.otpRequestHistory.filter(
                (timestamp) => timestamp > oneHourAgo
            );

            if (recentOtpRequests.length >= 5) {
                return res.status(429).send({ message: "Too many OTP requests. Please try again after some time." });
            }

            user.otpRequestHistory.push(new Date());
            await user.save();
        }
        else {
            return res.status(404).send({ success: false, message: "User does not exist" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const passwordResetOtpExpiry = new Date(Date.now() + 5 * 60 * 1000)

        user.passwordResetOtp = otp;
        user.passwordResetOtpExpiry = passwordResetOtpExpiry;
        await user.save()

        //! Nodemailer
        const mailOptions = {
            from: `"Blog" <${process.env.NODEMAILER_EMAIL}>`,
            to: email,
            subject: "Reset Password - Blog",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f7f7;">
                    <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #4CAF50;">Congratulations!</h2>
                        <p style="font-size: 16px; color: #555;">
                           Your OTP to reset your password is: <strong>${otp}</strong> It will expire in 5 minutes.
                        </p>
                        <p style="font-size: 14px; color: #999;">Thank you for contributing to Blog.</p>
                        <hr style="margin: 20px 0;">
                        <p style="font-size: 12px; color: #ccc; text-align: center;">Blog Team</p>
                    </div>
                </div>
            `,
        };

        await nodemailerTransporter.sendMail(mailOptions)

        res.status(200).send({
            sucess: true,
            message: "OTP sent to email",
        })

    } catch (error) {
        console.log("Error in seding opt: ", error)
        res.status(400).send({
            success: false,
            message: "Internal Server error",
            error: error.message
        })
    }
}


const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).send({ success: false, message: "Email, OTP, and new password are required" });
        }

        const user = await findByEmail({ email });

        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        if (user.passwordResetOtp !== otp) {
            return res.status(400).send({ success: false, message: "Invalid OTP" });
        }

        if (new Date() > user.passwordResetOtpExpiry) {
            return res.status(400).send({ success: false, message: "OTP has expired" });
        }

        // Check if new password is same as old password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).send({ success: false, message: "New password cannot be the same as the old password" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear OTP
        user.password = hashedPassword;
        user.passwordResetOtp = undefined;
        user.passwordResetOtpExpiry = undefined;

        await user.save();

        res.status(200).send({ success: true, message: "Password reset successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Server error",
            error: error.message,
        });
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
    updateUserProfile,
    forgetPassword,
    resetPassword,
    verifyOtpAndRegister,
}