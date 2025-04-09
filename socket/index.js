const IS_TYPING = require("./events/IS_TYPING")
const UPDATE_DRIVER_LAST_ONLINE_DATE = require("./events/UPDATE_DRIVER_LAST_ONLINE_DATE")

const handleSocketEvents = (io) => {
   io.on("connection", (socket) => {
      socket.on("join", (data) => {
         //     console.log(data.userType, data.userId, "Connect to a socket")
         socket.join(data.userId)
      })
      socket.on("UPDATE_DRIVER_LAST_ONLINE_DATE", (data) => UPDATE_DRIVER_LAST_ONLINE_DATE(data, io))
      socket.on("IS_TYPING", (data) => IS_TYPING(data, io))
   })
   io.on("disconnect", () => {
      console.log("user disconnected")
   })
}

module.exports = handleSocketEvents
