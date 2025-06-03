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

// ===== CONFIGURATION CORS EN PREMIER =====
// Configuration CORS complète
// ===== CONFIGURATION CORS EN PREMIER =====
// Configuration CORS complète
const corsOptions = {
  origin: "*", // ou spécifiez vos domaines
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "X-Access-Token",
    "timezone", // Ajout du header personnalisé
    "x-timezone" // Alternative si utilisé
  ],
  credentials: true,
  optionsSuccessStatus: 200 // Pour supporter les anciens navigateurs
};

app.use(cors(corsOptions));

// Gestion explicite des requêtes OPTIONS (preflight)
app.options('*', cors(corsOptions), (req, res) => {
  res.sendStatus(200);
});
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

// Configuration des middlewares
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Augmenter les limites et améliorer la configuration body-parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(fileUpload({
   limits: { fileSize: 10 * 1024 * 1024 },
}));

// Middleware de débogage amélioré
app.use((req, res, next) => {
   console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
   console.log('Headers:', req.headers);
   if (req.body && Object.keys(req.body).length > 0) {
      console.log('Body:', req.body);
   }
   
   // Ajouter headers de réponse pour debug
   res.on('finish', () => {
      console.log(`Response status: ${res.statusCode}`);
   });
   
   next();
});

// Middleware pour gérer les erreurs de parsing JSON
app.use((error, req, res, next) => {
   if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      console.error('Erreur de parsing JSON:', error);
      return res.status(400).json({
         statusCode: 400,
         httpStatus: 'BAD_REQUEST',
         message: 'JSON invalide dans la requête',
         result: []
      });
   }
   next(error);
});

// Middleware d'authentification
app.all("*", bindUserWithRefreshToken);

// Routes mobiles
app.use("/auth", authRouter);
app.use("/dashboard", requireAuth, dashboardRouter);
app.use("/message", requireAuth, messageRouter);

// Routes administratives - AJOUT D'UN MIDDLEWARE DE DEBUG
app.use("/admin", (req, res, next) => {
   console.log(`Route admin appelée: ${req.method} ${req.path}`);
   next();
}, adminRouter);

// Route de test de santé
app.get('/health', (req, res) => {
   res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      server: 'API Server'
   });
});

// Gestion des routes non trouvées
app.all("*", (req, res) => {
   console.log(`Route non trouvée: ${req.method} ${req.url}`);
   res.status(RESPONSE_CODES.NOT_FOUND).json({
      statusCode: RESPONSE_CODES.NOT_FOUND,
      httpStatus: RESPONSE_STATUS.NOT_FOUND,
      message: "Route non trouvée",
      result: [],
   });
});

// Gestion globale des erreurs
app.use((error, req, res, next) => {
   console.error('Erreur globale:', error);
   res.status(500).json({
      statusCode: 500,
      httpStatus: 'INTERNAL_SERVER_ERROR',
      message: 'Erreur interne du serveur',
      result: []
   });
});

// Configuration du serveur
const isHttps = process.env.ENABLE_HTTPS == true;
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

// Configuration de Socket.IO avec CORS amélioré
const io = new Server(server, {
   cors: { 
      origin: "*", 
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true
   },
   transports: ['websocket', 'polling']
});

// Gestion des événements Socket.IO
handleSocketEvents(io);
io.on("connection", (socket) => {
   console.log("Utilisateur connecté:", socket.id);
   
   socket.on("disconnect", () => {
      console.log("Utilisateur déconnecté:", socket.id);
   });
});

app.io = io;

module.exports = server;