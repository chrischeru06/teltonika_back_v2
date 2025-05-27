const RESPONSE_CODES = require("../../constants/RESPONSE_CODES");
const alldata = async (req, res) => {
    try {
        const { imei, gps, timestamp, priority, ioElements } = req.body;
        req.app.io.to("vehicule_change_${imei}").emit("DRIVVER", {
             imei,
            position: gps,
            timestamp,
            status:{priority,ioElements}
        })

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            message: "Les données ont été envoyées aux clients WebSocket",
            result:req.body,
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