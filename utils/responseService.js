const sendSuccess = (res, statusCode = 200, message, data) => {
    return res.status(statusCode).send({
        success: true,
        message,
        data,
    });
};

const sendError = (res, message, error) => {
    return res.status(400).send({
        success: false,
        message,
        error: error.message
    });
};


module.exports = { sendSuccess, sendError };
