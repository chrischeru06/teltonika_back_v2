const Upload = require("../Upload");
const IMAGES_DESTINATIONS = require("../../constants/IMAGES_DESTINATIONS");
const path = require('path')

class VehiculesMarqueUpload extends Upload {
    constructor() {
        super()
        this.destinationPath = path.resolve('./') + path.sep + 'public' + IMAGES_DESTINATIONS.VehiculeMarque
    }
}
module.exports = VehiculesMarqueUpload