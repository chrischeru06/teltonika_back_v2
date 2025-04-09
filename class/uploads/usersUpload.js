const Upload = require("../Upload");
const path = require('path')

class usersUpload extends Upload
{
          constructor() {
                    super()
                    this.destinationPath = path.resolve('./') + path.sep + 'public' + path.sep + 'uploads' + path.sep + 'drivers'
          }
}
module.exports = usersUpload