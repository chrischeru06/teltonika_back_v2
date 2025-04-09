const dotenv = require("dotenv")

dotenv.config()
module.exports = {
   DEFAULT_TIMEZONE: "Africa/bujumbura",
   BACKEND_URL: process.env.NODE_ENV == "local" ? "http://localhost:3000" : "https://prodev.mediabox.bi:1058",
   ALLOWED_ORIGINS: [
      "http://localhost:8000",
      "https://devapi.mediabox.bi:22605",
      "https://devapi.mediabox.bi:22705",
      "https://apps.mediabox.bi:22705",
      "https://devapi.mediabox.bi:28090",
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
