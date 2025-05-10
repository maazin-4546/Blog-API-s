const userRoutes = require("./userRoutes")
const blogRoutes = require("./blogRoutes")
const commentRoutes = require("./commentRoutes")
const dashboardRoutes = require("./dashboardRoutes")
const categoryRoutes = require("./categoryRoutes")
const tagRoutes = require("./tagRoutes")


const routes = [
    { path: "/user", route: userRoutes },
    { path: "/blog", route: blogRoutes },
    { path: "/comment", route: commentRoutes },
    { path: "/dashboard", route: dashboardRoutes },
    { path: "/category", route: categoryRoutes },
    { path: "/tag", route: tagRoutes },
]


module.exports = routes;