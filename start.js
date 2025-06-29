// server.js
const server = require("./app");

const PORT = process.env.PORT || 6500;

server.listen(PORT, () => {
   console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
