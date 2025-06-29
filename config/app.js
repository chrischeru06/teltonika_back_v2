const dotenv = require("dotenv")

dotenv.config()
module.exports = {
   DEFAULT_TIMEZONE: "Africa/bujumbura",
   BACKEND_URL: process.env.NODE_ENV == "local" ? "http://localhost:3000" : "http://31.97.54.87:6500/",
   ALLOWED_ORIGINS: [
      "http://31.97.54.87:5600/",
      "http://localhost:8000",
   ],
   IMAGES_MIMES: ["image/jpeg", "image/gif", "image/png"],
   /**
    * 5 minutes de temps d'expiration du token d'access pour l'application
    * @type { Number }
    */
   APP_ACCESS_TOKEN_MAX_AGE: 60 * 5,
   /**
    * Temps d'expiration du refresh token
    * @type { Number }
    */
   REFRESH_TOKEN_MAX_AGE: 3600 * 24 * 365 * 3,
}
