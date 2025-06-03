const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { IMAGES_MIMES } = require("../config/app");

class Upload {
  constructor() {
    this.destinationPath = path.join(process.cwd(), "public", "uploads");
    
    // Créer le dossier uploads avec les droits nécessaires dès l'instanciation
    this.ensureDirectoryExists(this.destinationPath);
  }

  /**
   * Crée un dossier avec les droits 0755 s'il n'existe pas
   */
  ensureDirectoryExists(dirPath) {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { 
          recursive: true,
          mode: 777 // Lecture/écriture pour l'owner, lecture pour les autres
        });
        console.log(`Dossier créé: ${dirPath}`);
      }
    } catch (error) {
      console.error(`Erreur création dossier ${dirPath}:`, error);
      throw new Error(`Impossible de créer le dossier: ${error.message}`);
    }
  }

  async upload(file, withThumb = true, fileDestination, enableCompressing = true) {
    try {
      const extname = fileDestination ? path.extname(fileDestination) : path.extname(file.name);
      const defaultFileName = Date.now() + extname;
      const finalFileName = fileDestination ? path.basename(fileDestination) : defaultFileName;
      const thumbName = path.parse(finalFileName).name + "_thumb" + path.extname(finalFileName);
      
      // Gestion cross-platform des chemins
      const destinationFolder = fileDestination 
        ? path.resolve(path.dirname(fileDestination))
        : this.destinationPath;
      
      const filePath = path.join(destinationFolder, finalFileName);
      const thumbPath = path.join(destinationFolder, thumbName);

      // Vérification et création du dossier si besoin
      this.ensureDirectoryExists(destinationFolder);

      const isImage = IMAGES_MIMES.includes(file.mimetype);
      let thumbInfo, fileInfo;

      // Traitement de la miniature
      if (withThumb && isImage) {
        thumbInfo = await sharp(file.data)
          .resize(354, 221, { fit: "inside" })
          .toFormat("jpg")
          .toFile(thumbPath);
      }

      // Traitement du fichier principal
      if (isImage && enableCompressing) {
        fileInfo = await sharp(file.data)
          .resize(500)
          .toFormat(extname.substring(1), { quality: 100 })
          .toFile(filePath.toLowerCase());
      } else {
        // Fallback pour les fichiers non-images
        await fs.promises.writeFile(filePath.toLowerCase(), file.data);
        fileInfo = { size: file.data.length };
      }

      return {
        fileInfo: { ...fileInfo, fileName: finalFileName },
        thumbInfo: withThumb ? { ...thumbInfo, thumbName } : undefined,
      };

    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      throw error;
    }
  }
}

module.exports = Upload;