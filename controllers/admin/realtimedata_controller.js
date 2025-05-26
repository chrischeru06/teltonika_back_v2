const RESPONSE_CODES = require("../../constants/RESPONSE_CODES");
const WebSocket = require('ws');

// Supposons que vous ayez un serveur WebSocket existant
const wss = new WebSocket.Server({ port: 8080 });

const alldata = async (req, res) => {
    try {
        const { routeda, imei } = req.body;

        // Émettre les données via WebSocket
        const message = {
            statusCode: RESPONSE_CODES.OK,
            message: "Les données émises",
            result: {
                routeda,
                imei,
            },
        };

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });

        // Répondre à la requête HTTP
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            message: "Les données ont été envoyées aux clients WebSocket",
            result: {
                routeda,
                imei,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        });
    }
};

module.exports = {
    alldata
};