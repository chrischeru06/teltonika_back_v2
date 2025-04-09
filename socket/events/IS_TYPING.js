const IS_TYPING = (data, io) => {
   const { userType, idRider, idDriver } = data
   if (userType == "rider") {
      io.to(`d_${idDriver}`).emit("IS_TYPING", { ...data })
   } else {
      io.to(`r_${idRider}`).emit("IS_TYPING", { ...data })
   }
}

module.exports = IS_TYPING
