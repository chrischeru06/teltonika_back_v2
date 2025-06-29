const express = require("express");
const https = require("https");
const http = require("http");
const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const RESPONSE_CODES = require("./constants/RESPONSE_CODES");
const RESPONSE_STATUS = require("./constants/RESPONSE_STATUS");
const app = express();

dotenv.config({ path: path.join(__dirname, "./.env") });

const { Server } = require("socket.io");
const authRouter = require("./routes/auth/authRouter");
const adminRouter = require("./routes/admin/adminRouter");
const dashboardRouter = require("./routes/dashboard/dashboardRouter");
const messageRouter = require("./routes/message/messageRouter");
const bindUserWithRefreshToken = require("./middlewares/bindUserWithRefreshToken");
const handleSocketEvents = require("./socket");
const requireAuth = require("./middlewares/requireAuth");
const i18n = require("i18n");
const { ALLOWED_ORIGINS } = require("./config/app");

// Configuration de i18n
i18n.configure({
   locales: ["fr", "en"],
   defaultLocale: "fr",
   retryInDefaultLocale: true,
   directory: path.join(__dirname, "/config/lang"),
   header: "accept-language",
   queryParameter: "lang",
   autoReload: process.env.NODE_ENV !== "TEST",
   syncFiles: false,
   updateFiles: false,
});
app.use(i18n.init);

// CORS simple (remplacer par corsOptions si besoin plus strict)
app.use(cors({ origin: "*" }));

// Configuration des middlewares
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(fileUpload({
   limits: { fileSize: 10 * 1024 * 1024 } // 10 Mo max
}));

// Middleware d’auth
app.use("*", bindUserWithRefreshToken);

// Déclaration des routes
app.use("/auth", authRouter);
app.use("/dashboard", requireAuth, dashboardRouter);
app.use("/message", requireAuth, messageRouter);
app.use("/admin", adminRouter);

// --- AJOUT DE LA ROUTE RACINE ---
app.get("/", (req, res) => {
  res.json({
    statusCode: 200,
    httpStatus: "OK",
    message: "Bienvenue sur l'API Teltonika",
    result: []
  });
});

// Route inconnue - catch all
app.all("*", (req, res) => {
   res.status(RESPONSE_CODES.NOT_FOUND).json({
      statusCode: RESPONSE_CODES.NOT_FOUND,
      httpStatus: RESPONSE_STATUS.NOT_FOUND,
      message: "Route non trouvée",
      result: [],
   });
});

// Configuration du serveur (HTTP par défaut)
const isHttps = process.env.ENABLE_HTTPS === "1"; // sécuriser la comparaison
let server;

if (isHttps) {
   try {
      const options = {
         key: fs.readFileSync("/var/www/html/api/https/privkey.pem"),
         cert: fs.readFileSync("/var/www/html/api/https/fullchain.pem"),
      };
      server = https.createServer(options, app);
   } catch (err) {
      console.error("Erreur de certificat HTTPS :", err.message);
      process.exit(1); // Arrête l'app si HTTPS échoue
   }
} else {
   server = http.createServer(app);
}

// Socket.IO
const io = new Server(server, {
   cors: { origin: "*", methods: ["GET", "POST"], credentials: true }
});

handleSocketEvents(io);
app.io = io;

module.exports = server;
