const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');

const {
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
} = require('../controller/userController');


router.post("/register", registerUser)

router.post("/verify-otp-register", authorize(['user', 'author']), verifyOtpAndRegister)

router.post("/login", loginUser)

router.post("/logout", logoutUser)

router.post("/forget-password", authorize(['user', 'admin']), forgetPassword)

router.post("/reset-password", authorize(['user', 'admin']), resetPassword)

router.get("/user-details", authorize(['user', 'author', 'admin']), getCurrentUser)

router.get("/all-users", authorize(['admin']), getAllUsers)

router.get("/:id", authorize(['admin']), getUserById)

router.put('/:id/status', authorize(['admin']), updateUserStatus);

router.put('/:id/role', authorize(['admin']), updateUserRole);

router.delete('/:id/delete', authorize(['admin']), deleteUser);

router.put('/update-profile', authorize(['user', 'author']), updateUserProfile);




module.exports = router;