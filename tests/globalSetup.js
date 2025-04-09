const dotenv = require("dotenv")
dotenv.config()

module.exports = async () => {
   // Set NODE_ENV to TEST
   process.env.NODE_ENV = "TEST"
}
