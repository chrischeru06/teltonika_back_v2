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
app.use(
   cors({
     origin: "*",
   })
 );
// Configuration CORS
// var corsOptions = {
//    origin: function (origin, callback) {
//       if (!origin || (origin && ALLOWED_ORIGINS.indexOf(origin) !== -1)) {
//          callback(null, true);
//       } else {
//          callback(new Error("Not allowed by CORS"));
//       }
//    },
// };

// app.use(cors(corsOptions));

// Configuration des middlewares
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload({
   limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10 Mo pour les fichiers
}));

// Middleware de débogage
app.use((req, res, next) => {
   // console.log(`Received ${req.method} request to ${req.url} with body:`, req.body);
   next();
});

// Middleware d'authentification
app.all("*", bindUserWithRefreshToken);

// Routes mobiles
app.use("/auth", authRouter);
app.use("/dashboard", requireAuth, dashboardRouter);
app.use("/message", requireAuth, messageRouter);

// Routes administratives
app.use("/admin", adminRouter);

// Gestion des routes non trouvées
app.all("*", (req, res) => {
   res.status(RESPONSE_CODES.NOT_FOUND).json({
      statusCode: RESPONSE_CODES.NOT_FOUND,
      httpStatus: RESPONSE_STATUS.NOT_FOUND,
      message: "Route non trouvée",
      result: [],
   });
});

// Configuration du serveur
const isHttps = process.env.ENABLE_HTTPS == 1;
let server;
if (isHttps) {
   const options = {
      key: fs.readFileSync("/var/www/html/api/https/privkey.pem"),
      cert: fs.readFileSync("/var/www/html/api/https/fullchain.pem"),
   };
   server = https.createServer(options, app);
} else {
   server = http.createServer(app);
}

// Configuration de Socket.IO
const io = new Server(server, {
   cors: { origin: "*", methods: ["GET", "POST"] },
});

// Gestion des événements Socket.IO
handleSocketEvents(io);
io.on("disconnect", () => {
   console.log("user disconnected");
});

app.io = io;

module.exports = server;