const net = require('net');
const Parser = require('teltonika-parser-ex');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const winston = require('winston');
const express = require('express');
const https = require('https');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const i18n = require('i18n');

// Import routes and configs
const authRouter = require("./routes/auth/authRouter");
const adminRouter = require("./routes/admin/adminRouter");
const dashboardRouter = require("./routes/dashboard/dashboardRouter");
const messageRouter = require("./routes/message/messageRouter");
const bindUserWithRefreshToken = require("./middlewares/bindUserWithRefreshToken");
const handleSocketEvents = require("./socket");
const requireAuth = require("./middlewares/requireAuth");
const RESPONSE_CODES = require("./constants/RESPONSE_CODES");
const RESPONSE_STATUS = require("./constants/RESPONSE_STATUS");

// Configuration
dotenv.config({ path: path.join(__dirname, "./.env") });

const TCP_PORT = 2354;
const HTTP_PORT = process.env.PORT || 8000;
const TCP_TIMEOUT = 300000;
const IMEI_FOLDER_BASE = '/var/www/html/api_teltonika/IMEI';
const MAX_GEOJSON_SIZE = 100 * 1024 * 1024;
const IMEI_REGEX = /^\d{15}$/;

// Validate and create base directory
if (!fs.existsSync(IMEI_FOLDER_BASE)) {
  fs.mkdirSync(IMEI_FOLDER_BASE, { recursive: true, mode: 0o755 });
}

const deviceState = new Map();

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' })
  ]
});

// Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Chris@1996..',
  database: process.env.DB_NAME || 'car_trucking_v3',
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
};

let db;
async function initDbPool() {
  try {
    db = await mysql.createPool(dbConfig);
    logger.info('MySQL pool created');
  } catch (err) {
    logger.error('MySQL pool creation failed:', err.message);
    setTimeout(initDbPool, 5000);
  }
}
initDbPool();

// === Helper Functions ===
function toMysqlDatetime(isoDate) {
  return isoDate.replace('T', ' ').replace('Z', '').split('.')[0];
}

function isValidGps(gps) {
  return gps && gps.latitude !== 0 && gps.longitude !== 0 &&
    Math.abs(gps.latitude) <= 90 && Math.abs(gps.longitude) <= 180;
}

function isValidImei(imei) {
  return IMEI_REGEX.test(imei);
}

function getImeiFolder(imei) {
  if (!isValidImei(imei)) {
    throw new Error(`Invalid IMEI format: ${imei}`);
  }
  const folder = path.join(IMEI_FOLDER_BASE, imei);
  if (!path.resolve(folder).startsWith(path.resolve(IMEI_FOLDER_BASE))) {
    throw new Error(`Invalid folder path for IMEI: ${imei}`);
  }
  return folder;
}

async function createImeiFolder(imei) {
  const folder = getImeiFolder(imei);
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true, mode: 0o755 });
    logger.info(`Created folder for IMEI: ${imei}`);
  }
  return folder;
}

async function insertTrackingData(values) {
  const query = `INSERT INTO tracking_data (
    latitude, longitude, vitesse, altitude, date,
    angle, satellites, mouvement, gnss_statut,
    device_uid, ignition
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  try {
    await db.execute(query, values);
  } catch (err) {
    logger.error('Insert Error:', err.message);
  }
}

// === Express App Setup ===
const app = express();

// i18n Configuration
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

// Middlewares
app.use(i18n.init);
app.use(cors({ origin: "*" }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file limit
}));

// Debug middleware
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  next();
});

// Authentication middleware
app.all("*", bindUserWithRefreshToken);

// Routes
app.use("/auth", authRouter);
app.use("/dashboard", requireAuth, dashboardRouter);
app.use("/message", requireAuth, messageRouter);
app.use("/admin", adminRouter);

// Teltonika API Routes
app.use('/media', express.static(IMEI_FOLDER_BASE));

app.get('/api/get_historiques_trajets/', async (req, res) => {
  const { device_uid } = req.query;

  if (!device_uid || !isValidImei(device_uid)) {
    return res.status(400).json({ message: 'Valid DEVICE_UID (15 digits) required' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT * FROM path_histo_trajet_geojson WHERE DEVICE_UID = ? ORDER BY TRIP_START DESC`,
      [device_uid]
    );
 
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No trips found for this DEVICE_UID' });
    }

    return res.status(200).json(rows);
  } catch (error) {
    logger.error('Error fetching trips:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/last-trajets', async (req, res) => { 
  try {  
    const [rows] = await db.execute(`
      SELECT DEVICE_UID, TRIP_START, TRIP_END, PATH_FILE, LATITUDE, LONGITUDE
      FROM (
        SELECT *,
               ROW_NUMBER() OVER (PARTITION BY DEVICE_UID ORDER BY TRIP_END DESC) AS rn
        FROM path_histo_trajet_geojson
      ) AS t
      WHERE t.rn = 1
    `);
    res.status(200).json(rows);
  } catch (err) {
    logger.error('Error fetching last trips:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 404 Handler
app.all("*", (req, res) => {
  res.status(RESPONSE_CODES.NOT_FOUND).json({
    statusCode: RESPONSE_CODES.NOT_FOUND,
    httpStatus: RESPONSE_STATUS.NOT_FOUND,
    message: "Route non trouvée",
    result: [],
  });
});

// === Server Setup ===
const isHttps = process.env.ENABLE_HTTPS == 1;
let server;

if (isHttps) {
  const options = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
  };
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

// Socket.IO Configuration
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  credentials: true
});

// Socket.IO Events
handleSocketEvents(io);
io.on("connection", socket => {
  logger.info('Socket.IO client connected');

  socket.on('subscribe', imei => {
    if (!isValidImei(imei)) {
      logger.warn(`Invalid IMEI subscription attempt: ${imei}`);
      return;
    }
    socket.join(imei);
    logger.info(`Client subscribed to IMEI: ${imei}`);
  });

  socket.on('unsubscribe', imei => {
    socket.leave(imei);
    logger.info(`Client unsubscribed from IMEI: ${imei}`);
  });

  socket.on("disconnect", () => {
    logger.info("user disconnected");
  });
});

app.io = io;

// === TCP Server ===
const tcpServer = net.createServer(socket => {
  logger.info('TCP client connected');
  let imei = null;
  socket.setTimeout(TCP_TIMEOUT);

  socket.on('timeout', () => {
    logger.info(`Socket timeout for IMEI: ${imei}`);
    socket.end();
  });

  socket.on('end', () => {
    if (imei) {
      deviceState.delete(imei);
      logger.info(`Connection ended for IMEI: ${imei}`);
    }
  });

  socket.on('error', err => {
    logger.error(`Socket error for IMEI ${imei}:`, err.message);
    if (imei) deviceState.delete(imei);
  });

  socket.on('data', async data => {
    try {
      const parser = new Parser(data);

      if (parser.isImei) {
        imei = parser.imei;
        if (!isValidImei(imei)) {
          logger.error(`Invalid IMEI received: ${imei}`);
          socket.end();
          return;
        }

        socket.write(Buffer.from([0x01]));
        if (!deviceState.has(imei)) {
          deviceState.set(imei, { lastIgnition: null });
          await createImeiFolder(imei);
        }
        return;
      }

      if (!imei) {
        logger.warn('Received data before IMEI');
        return;
      }

      const avl = parser.getAvl();
      if (!avl?.records?.length) return;

      const state = deviceState.get(imei);

      for (const record of avl.records) {
        const { gps, timestamp, ioElements } = record;
        if (!isValidGps(gps)) continue;

        const ioData = {
          ignition: ioElements.find(e => e.label === 'Ignition')?.value || 0,
          mouvement: ioElements.find(e => e.label === 'Movement')?.value || 0,
          gnss_statut: ioElements.find(e => e.label === 'GNSS Status')?.value || 1,
        };

        const timestampIso = toMysqlDatetime(new Date(timestamp).toISOString());

        if (ioData.ignition === 1) {
          const values = [
            gps.latitude, gps.longitude, gps.speed || 0, gps.altitude, timestampIso,
            gps.angle, gps.satellites, ioData.mouvement, ioData.gnss_statut, imei, ioData.ignition
          ];

          await insertTrackingData(values);
        }

        io.emit('tracking_data', {
          imei,
          latitude: gps.latitude,
          longitude: gps.longitude,
          speed: gps.speed,
          altitude: gps.altitude,
          timestamp: timestampIso,
          angle: gps.angle,
          satellites: gps.satellites,
          ignition: ioData.ignition,
          movement: ioData.mouvement,
          gnss_status: ioData.gnss_statut
        });

        // Trip handling logic...
        // (Keep the same trip handling logic from your original code)
      }
    } catch (err) {
      logger.error(`Processing error for IMEI ${imei}:`, err.message);
    }
  });
});

// === Server Startup ===
tcpServer.listen(TCP_PORT, () => {
  logger.info(`TCP Server running on port ${TCP_PORT}`);
});

server.listen(HTTP_PORT, () => {
  logger.info(`HTTP/WebSocket Server running on port ${HTTP_PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = server;