const Upload = require("../Upload");
const IMAGES_DESTINATIONS = require("../../constants/IMAGES_DESTINATIONS");
const path = require('path')

class VehiculesModeleUpload extends Upload {
    constructor() {
        super()
        this.destinationPath = path.resolve('./') + path.sep + 'public' + IMAGES_DESTINATIONS.VehiculeModele
    }
}
module.exports = VehiculesModeleUpload