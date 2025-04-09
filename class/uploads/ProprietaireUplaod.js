const Upload = require("../Upload");
const IMAGES_DESTINATIONS = require("../../constants/IMAGES_DESTINATIONS");
const path = require('path')

class ProprietaireUpload extends Upload {
    constructor() {
        super()
        this.destinationPath = path.resolve('./') + path.sep + 'public' + IMAGES_DESTINATIONS.Proprietairefilecni
        this.destinationPath = path.resolve('./') + path.sep + 'public' + IMAGES_DESTINATIONS.Proprietairefilenif
        this.destinationPath = path.resolve('./') + path.sep + 'public' + IMAGES_DESTINATIONS.Proprietairefilerc
        this.destinationPath = path.resolve('./') + path.sep + 'public' + IMAGES_DESTINATIONS.Proprietairelogo
        this.destinationPath = path.resolve('./') + path.sep + 'public' + IMAGES_DESTINATIONS.Proprietairepassport
    }
}
module.exports = ProprietaireUpload