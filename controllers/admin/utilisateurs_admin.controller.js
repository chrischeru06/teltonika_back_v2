/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express")
const moment = require("moment-timezone")

/**
 * Permet de creer un corporate
 * @date  10/07/2023
 * @param {express.Request} req
 * @param {express.Response} res
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */
const createUtilisateur = async (req, res) => {
   try {
      const { NOM, PRENOM, TELEPHONE, EMAIL, USERNAME, ID_PROFIL, roles, ID_CORP_CORPORATE } = req.body
      const files = req.files || {}
      const { IMAGE } = files

      const data = { ...req.body, ...req.files }

      const validation = new Validation(
         data,
         {
            NOM: {
               required: true,
               length: [1, 250],
            },
            PRENOM: {
               required: true,
               length: [1, 250],
            },
            TELEPHONE: {
               required: true,
               length: [1, 250],
               number: true,
            },
            EMAIL: {
               email: true,
               required: true,
               alpha: true,
               length: [1, 250],
               unique: "utilisateurs,EMAIL",
            },
            USERNAME: {
               required: true,
               length: [1, 250],
            },

            ID_PROFIL: {
               required: true,
               length: [1, 250],
            },
            IMAGE: {
               required: true,
               image: 20000000,
            },
         },
         {
            NOM: {
               required: req.__("utilisateurs_admin.controller.createUtilisateur.required"),
               alpha: req.__("utilisateurs_admin.controller.createUtilisateur.Nom_invalide"),
               length: req.__("utilisateurs_admin.controller.createUtilisateur.NomLenght"),
            },
            PRENOM: {
               required: req.__("utilisateurs_admin.controller.createUtilisateur.required"),
               alpha: req.__("utilisateurs_admin.controller.createUtilisateur.prenomAlpha"),
               length: req.__("utilisateurs_admin.controller.createUtilisateur.prenomLenght"),
            },
            TELEPHONE: {
               required: req.__("utilisateurs_admin.controller.createUtilisateur.required"),
               length: req.__("utilisateurs_admin.controller.createUtilisateur.telephoneLenght"),
               number: req.__("utilisateurs_admin.controller.createUtilisateur.telephoneNumber"),
            },
            EMAIL: {
               required: req.__("utilisateurs_admin.controller.createUtilisateur.required"),
               alpha: req.__("utilisateurs_admin.controller.createUtilisateur.EmailAlpha"),
               length: req.__("utilisateurs_admin.controller.createUtilisateur.EmailLenght"),
               unique: req.__("utilisateurs_admin.controller.createUtilisateur.EmailUnique"),
            },
            USERNAME: {
               required: req.__("utilisateurs_admin.controller.createUtilisateur.required"),
               alpha: "Le nom  est invalide",
               length: "le nom ne doit pas depasse max(250 carateres)",
            },
            ID_PROFIL: {
               required: req.__("utilisateurs_admin.controller.createUtilisateur.required"),
            },
            PROFIL: {
               required: req.__("utilisateurs_admin.controller.createUtilisateur.required"),
            },
            IMAGE: {
               required: req.__("utilisateurs_admin.controller.createUtilisateur.required"),
               image: req.__("utilisateurs_admin.controller.createUtilisateur.Image"),
            },
         },
      )
      await validation.run()
      const isValid = await validation.isValidate()
      if (!isValid) {
         const errors = await validation.getErrors()
         return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
            statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
            httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
            message: "Probleme de validation des donnees",
            result: errors,
         })
      }

      var IMAGE_USER
      const userUpload = new UtilisateurUpload()

      if (IMAGE) {
         const { fileInfo: fileInfo_4, thumbInfo: thumbInfo_4 } = await userUpload.upload(IMAGE, false)
         IMAGE_USER = fileInfo_4
      }

      const salt = await bcrypt.genSalt()
      const PASSWORD = await bcrypt.hash(TELEPHONE, salt)

      //trouver le nom et prenom de l'utilisateur connecte
      const findoneuser = await Utilisateurs.findOne({
         attributes: ["NOM", "PRENOM"],
         where: {
            ID_UTILISATEUR: req.userId,
         },
      })

      const utilisateur = await Utilisateurs.create({
         NOM,
         PRENOM,
         TELEPHONE,
         EMAIL,
         IMAGE: IMAGE_USER
            ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.Utilisateur}/${IMAGE_USER.fileName}`
            : null,
         USERNAME,
         PASSWORD: PASSWORD,
         ID_PROFIL,
         IS_ACTIF: 0,
         ID_CORP_CORPORATE: ID_CORP_CORPORATE ? ID_CORP_CORPORATE : null,
      })

      await Activity_logs.create({
         ID_UTILISATEUR: req.userId,
         ID_ACTIVITY_TYPE: ACTIVITY_LOGS_TYPES.CREATE_USER,
         DESCRIPTION: `${findoneuser.NOM} ${findoneuser.PRENOM} à créer l'utilisateur ${NOM} ${PRENOM}`,
      })

      // const allrole = JSON.parse(roles)
      // const roleData = allrole.map(reponse => {
      //   return {
      //     ID_UTILISATEUR: utilisateur.ID_UTILISATEUR,
      //     ID_ROLE: reponse.ID_ROLE,
      //     CAN_READ: reponse.CAN_READ,
      //     CAN_WRITE: reponse.CAN_WRITE
      //   }
      // })

      // await Utilisateur_roles.bulkCreate(roleData)

      res.status(RESPONSE_CODES.CREATED).json({
         statusCode: RESPONSE_CODES.CREATED,
         httpStatus: RESPONSE_STATUS.CREATED,
         message: "Utilisateur a ete cree avec succes",
         result: utilisateur,
      })
   } catch (error) {
      console.log(error)
      res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
         statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
         httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
         message: "Erreur interne du serveur, réessayer plus tard",
      })
   }
}
module.exports = {
   createUtilisateur,
}
