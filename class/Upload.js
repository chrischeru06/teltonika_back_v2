const path = require("path")
const fs = require("fs")
const sharp = require("sharp")
const { IMAGES_MIMES } = require("../config/app")

class Upload {
   constructor() {
      this.destinationPath = path.resolve("./") + path.sep + "public" + path.sep + "uploads"
   }

   async upload(file, withThumb = true, fileDestination, enableCompressing = true) {
      // eslint-disable-next-line no-useless-catch
      try {
         const extname = fileDestination ? path.extname(fileDestination) : path.extname(file.name)
         const defaultFileName = Date.now() + extname
         const finalFileName = fileDestination ? path.basename(fileDestination) : defaultFileName
         const thumbName = path.parse(finalFileName).name + "_thumb" + path.extname(finalFileName)
         const destinationFolder = fileDestination ? path.dirname(fileDestination) : this.destinationPath
         const filePath = destinationFolder + path.sep + finalFileName
         const thumbPath = destinationFolder + path.sep + thumbName
         if (!fs.existsSync(destinationFolder)) {
            fs.mkdirSync(destinationFolder, { recursive: true })
         }
         const isImage = IMAGES_MIMES.includes(file.mimetype)
         var thumbInfo = undefined
         if (withThumb && isImage) {
            thumbInfo = await sharp(file.data).resize(354, 221, { fit: "inside" }).toFormat("jpg").toFile(thumbPath)
         }
         var fileInfo = {}
         if (isImage && enableCompressing) {
            fileInfo = await sharp(file.data)
               .resize(500)
               .toFormat(extname.substring(1), { quality: 100 })
               .toFile(filePath.toLowerCase())
         } else {
            fileInfo = await file.mv(filePath.toLowerCase())
         }
         return {
            fileInfo: { ...fileInfo, fileName: finalFileName },
            thumbInfo: withThumb ? { ...thumbInfo, thumbName } : undefined,
         }
      } catch (error) {
         throw error
      }
   }
}

module.exports = Upload
