const express = require("express")
const cookieParser = require('cookie-parser');
const DbConnection = require("./config/dbConnection");
const routes = require("./routes");
require('dotenv').config()

const app = express()
const PORT = 5000

// Middlewares
app.use(express.json())
app.use(cookieParser())

// Database Connection
DbConnection()

// Routes
routes.forEach(({ path, route }) => {
    app.use(path, route);
})


app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`))
