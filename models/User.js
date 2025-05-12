const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'author', 'user'],
        default: 'user',
    },
    profilePic: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'banned'],
        default: 'active',
    },
    emailVerificationOtp: { type: String },
    emailVerificationOtpExpiry: { type: Date },
    passwordResetOtp: { type: String },
    passwordResetOtpExpiry: { type: Date },
    otpRequestHistory: {
        type: [Date],
        default: [],
    },

}, { timestamps: true });


const User = mongoose.model('User', userSchema);
module.exports = User;
