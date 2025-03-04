require("dotenv").config();
const ENV = process.env.NODE_ENV;
const isDev = ENV === "DEV";

module.exports = isDev;
