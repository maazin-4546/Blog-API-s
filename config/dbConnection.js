const mongoose = require("mongoose")

const DbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database Connected")

    } catch (error) {
        console.log("Error in connecting databse", error)
    }
}

module.exports = DbConnection;