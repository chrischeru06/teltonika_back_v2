const ip = require("ip")
const path = require("path")
const dotenv = require("dotenv")
dotenv.config({ path: path.join(__dirname, "./.env") })
const server = require("./app")
const DISCONNECT_DRIVERS = require("./crons/DISCONNECT_DRIVERS")

const port = process.env.PORT || 8000
server.listen(port, async () => {
   try {
      // crons
      DISCONNECT_DRIVERS()
      console.log(`${process.env.NODE_ENV.toUpperCase()} - Server is running on : http://${ip.address()}:${port}/`)
   } catch (error) {
      console.log(error)
   }
})
