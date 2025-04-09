/* eslint-disable no-undef */
const dotenv = require("dotenv")
dotenv.config()

/**
 * Permet de vérifier la connexion d'un utilisateur
 * @author NIREMA ELOGE <nirema.eloge@mediabox.bi>
 * @param {express.Request} res
 * @param {express.Response} res
 */
const login = async (req, res) => {
   try {
      const { email, password, deviceInfo: deviceInfoStr } = req.body
      var deviceInfo
      if (deviceInfoStr) {
         deviceInfo = JSON.parse(deviceInfoStr)
      }
      const validation = new Validation(
         req.body,
         {
            email: {
               required: true,
               length: [1, 100],
            },
            password: {
               required: true,
            },
         },
         {
            password: {
               required: "Le mot de passe est obligatoire",
            },
            email: {
               required: "L'email est obligatoire",
               email: "Email invalide",
            },
         },
      )
      await validation.run()
      const isValid = await validation.isValidate()
      const errors = await validation.getErrors()
      if (!isValid) {
         return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
            statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
            httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
            message: "Probleme de validation des donnees",
            result: errors,
         })
      }
      const userObject = await Utilisateurs.findOne({
         where: { EMAIL: email, IS_ACTIF: 1 },
         attributes: [
            "ID_UTILISATEUR",
            "PASSWORD",
            "ID_PROFIL",
            "TELEPHONE",
            "EMAIL",
            "NOM",
            "PRENOM",
            "IS_ACTIF",
            "IMAGE",
            "ID_CORP_CORPORATE",
            "ID_RIDER",
         ],
         include: [
            {
               model: Profil,
               as: "profil",
               attributes: ["ID_PROFIL", "DESCRIPTION"],
               required: true,
               include: [
                  {
                     model: Profil_roles,
                     attributes: ["ID_ROLE", "CAN_READ", "CAN_WRITE"],
                     as: "profil_roles",
                     required: false,
                  },
               ],
            },
            // ,
            // {
            //     model:Utilisateur_roles,
            //     as: "utilisateur_roles",
            //     attributes: ["ID_ROLE","CAN_READ","CAN_WRITE"],
            //     separate: true, // Sépare les résultats des rôles de l'utilisateur
            //     order: [['ID_ROLE', 'ASC']] // Ordonne par l'ID_ROLE du modèle Utilisateur_roles
            // }
         ],
         order: [[{ model: Profil, as: "profil" }, { model: Profil_roles, as: "profil_roles" }, "ID_ROLE", "ASC"]],
      })
      if (userObject) {
         const user = userObject.toJSON()
         const validPassword = await bcrypt.compare(password, user.PASSWORD)
         if (validPassword) {
            const tokenData = {
               user: user.ID_UTILISATEUR,
               ID_PROFIL: PROFILS.admin,
            }
            const token = generateToken(tokenData, TOKENS_CONFIG.APP_ACCESS_TOKEN_MAX_AGE)
            const JWT_REFRESH_PRIVATE_KEY = process.env.JWT_REFRESH_PRIVATE_KEY
            const refreshToken = jwt.sign(tokenData, JWT_REFRESH_PRIVATE_KEY, {
               expiresIn: TOKENS_CONFIG.REFRESH_TOKEN_MAX_AGE,
            })
            // saving notification token and refresh token
            await Utilisateurs_tokens.create({
               ID_UTILISATEUR: user.ID_UTILISATEUR,
               REFRESH_TOKEN: refreshToken,
               userAgent: deviceInfo?.userAgent,
               vendor: deviceInfo?.vendor,
               platform: deviceInfo?.platform,
               appCodeName: deviceInfo?.appCodeName,
               appName: deviceInfo?.appName,
               appVersion: deviceInfo?.appVersion,
               browserName: deviceInfo?.browserName,
               browserVersion: deviceInfo?.browserVersion,
               osName: deviceInfo?.osName,
               osVersion: deviceInfo?.osVersion,
               mobile: deviceInfo?.mobile,
            })
            let userRoles
            // if(user.profil.profil_roles.length === 0){
            //     const roles = user.utilisateur_roles.map(role => {
            //             return role
            //     })
            //      userRoles = {
            //         ...user,
            //         profil: {
            //             ...user.profil,
            //             profil_roles: roles
            //         }
            //     }
            // }else{
            const roles = user.profil.profil_roles.map((role) => {
               // const utiRole = user.utilisateur_roles.find(r => r.ID_ROLE == role.ID_ROLE)
               // if(utiRole) {
               //     return {
               //         ...role,
               //         ...utiRole
               //     }
               // } else {
               return role
               // }
            })
            // const corp = await Corp_corporates.findOne({
            //     attributes:['ID_CORP_CORPORATE','ID_UTILISATEUR'],
            //     where:{
            //        ID_UTILISATEUR:user.ID_UTILISATEUR
            //     }
            // })

            userRoles = {
               ...user,
               profil: {
                  ...user.profil,
                  profil_roles: roles,
               },
            }
            // }

            // eslint-disable-next-line no-unused-vars
            const { PASSWORD, utilisateur_roles, ...other } = userRoles
            res.status(RESPONSE_CODES.CREATED).json({
               statusCode: RESPONSE_CODES.CREATED,
               httpStatus: RESPONSE_STATUS.CREATED,
               message: "Vous êtes connecté avec succès",
               result: {
                  ...other,
                  token,
                  REFRESH_TOKEN: refreshToken,
               },
            })
         } else {
            validation.setError("main", "Identifiants incorrects")
            const errors = await validation.getErrors()
            res.status(RESPONSE_CODES.NOT_FOUND).json({
               statusCode: RESPONSE_CODES.NOT_FOUND,
               httpStatus: RESPONSE_STATUS.NOT_FOUND,
               message: "Utilisateur n'existe pas",
               result: errors,
            })
         }
      } else {
         validation.setError("main", "Identifiants incorrects")
         const errors = await validation.getErrors()
         res.status(RESPONSE_CODES.NOT_FOUND).json({
            statusCode: RESPONSE_CODES.NOT_FOUND,
            httpStatus: RESPONSE_STATUS.NOT_FOUND,
            message: "Utilisateur n'existe pas",
            result: errors,
         })
      }
   } catch (error) {
      console.log(error)
      res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
         statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
         httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
         message: "Erreur interne du serveur, réessayer plus tard",
      })
   }
}

/**
 * Marque l'utilisateur comme deconnecte
 * @author Dukizwe Darcie <darcy@mediabox.bi>
 * @date 20/09/2023
 * @param {express.Request} req
 * @param {express.Response} res
 */
const logout = async (req, res) => {
   try {
      const { REFRESH_TOKEN, user } = req.body
      const sessionObject = await Utilisateurs_tokens.findOne({
         where: {
            IS_ACTIVE: 1,
            REFRESH_TOKEN: REFRESH_TOKEN,
            ID_UTILISATEUR: user,
         },
         attributes: ["ID_UTILISATEUR_TOKEN"],
      })
      if (sessionObject) {
         const session = sessionObject.toJSON()
         await Utilisateurs_tokens.update(
            {
               IS_ACTIVE: 0,
            },
            {
               where: {
                  ID_UTILISATEUR_TOKEN: session.ID_UTILISATEUR_TOKEN,
               },
            },
         )
      }
      res.status(RESPONSE_CODES.OK).json({
         statusCode: RESPONSE_CODES.OK,
         httpStatus: RESPONSE_STATUS.OK,
         message: "Utilisateur deconnecte avec succes",
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

/**
 * Permet de retourner un nouveau access token
 * @param {express.Request} req
 * @param {express.Response} res
 * @author darcydev <darcy@mediabox.bi>
 * @date 20/09/2023
 */
const getNewAccessToken = async (req, res) => {
   try {
      const bearer = req.headers.authorization
      const bearerToken = bearer && bearer.split(" ")[1]
      const accessToken = bearerToken
      const refreshToken = req.headers["x-refresh-token"]
      const validation = new Validation(
         { accessToken, refreshToken },
         {
            accessToken: {
               required: true,
            },
            refreshToken: {
               required: true,
            },
         },
      )
      const isValid = await validation.isValidate()
      if (!isValid) {
         const errors = await validation.getErrors()
         return res.status(422).json({ errors })
      }

      jwt.verify(
         refreshToken,
         process.env.JWT_REFRESH_PRIVATE_KEY || DEFAULT_JWT_REFRESH_PRIVATE_KEY,
         async (error) => {
            try {
               if (error) {
                  return res.status(422).json({ message: "Invalid refresh token", authStatus: req.authStatus })
               }
               const userObject = await Utilisateurs_tokens.findOne({
                  attributes: ["ID_UTILISATEUR_TOKEN"],
                  where: {
                     REFRESH_TOKEN: refreshToken,
                     IS_ACTIVE: 1,
                  },
                  include: [
                     {
                        model: Utilisateurs,
                        required: true,
                        as: "utilisateur",
                        attributes: ["ID_UTILISATEUR"],
                     },
                  ],
               })
               if (!userObject) {
                  return res.status(422).json({ message: "Invalid refresh token", authStatus: req.authStatus })
               }
               const user = await userObject.toJSON()
               var maxAge = TOKENS_CONFIG.APP_ACCESS_TOKEN_MAX_AGE
               const tokenData = {
                  user: user.utilisateur.ID_UTILISATEUR,
                  ID_PROFIL: PROFILS.admin,
               }
               res.status(RESPONSE_CODES.OK).json({
                  statusCode: RESPONSE_CODES.OK,
                  httpStatus: RESPONSE_STATUS.OK,
                  message: "Nouveau access token",
                  result: generateToken(tokenData, maxAge),
               })
            } catch (error) {
               console.log(error)
               res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
                  statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                  httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
                  message: "Erreur interne du serveur, réessayer plus tard",
               })
            }
         },
      )
   } catch (error) {
      console.log(error)
      res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
         statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
         httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
         message: "Erreur interne du serveur, réessayer plus tard",
      })
   }
}

/**
 * Permet de recuperer les droit d'un profil par Id
 * @date  08/02/2024
 * @param {express.Request} req
 * @param {express.Response} res
 * @author Jospin BA <jospin@mdiabox.bi>
 */

const findRolesByProfil = async (req, res) => {
   try {
      const { ID_PROFIL } = req.params
      const roles = await Profil.findOne({
         where: {
            ID_PROFIL,
         },
         include: [
            {
               model: Profil_roles,
               attributes: ["ID_ROLE", "CAN_READ", "CAN_WRITE"],
               as: "profil_roles",
               required: true,
               //   include:[
               //     {
               //         model:Roles,
               //         as:"role",
               //         attributes:["ROLE"]
               //     }
               //   ]
            },
         ],
      })
      if (roles) {
         res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Le profile est trouve",
            result: roles,
         })
      } else {
         res.status(RESPONSE_CODES.NOT_FOUND).json({
            statusCode: RESPONSE_CODES.NOT_FOUND,
            httpStatus: RESPONSE_STATUS.NOT_FOUND,
            message: "Profile non trouvee",
         })
      }
   } catch (error) {
      console.log(error)
      res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
         statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
         httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
         message: "Erreur interne du serveur, réessayer plus tard",
      })
   }
}

/**
 * Permet de recuperer les informations de l'utilisateur connecté
 * @date  14/02/2024
 * @param {express.Request} req
 * @param {express.Response} res
 * @author Jospin BA <jospin@mdiabox.bi>
 */

const findUserInfo = async (req, res) => {
   try {
      const userObject = await Utilisateurs.findOne({
         where: { ID_UTILISATEUR: req.userId },
         attributes: [
            "ID_UTILISATEUR",
            "ID_PROFIL",
            "TELEPHONE",
            "EMAIL",
            "NOM",
            "PRENOM",
            "IS_ACTIF",
            "IMAGE",
            "ID_CORP_CORPORATE",
         ],
         include: [
            {
               model: Profil,
               as: "profil",
               attributes: ["ID_PROFIL", "DESCRIPTION"],
               required: true,
               include: [
                  {
                     model: Profil_roles,
                     attributes: ["ID_ROLE", "CAN_READ", "CAN_WRITE"],
                     as: "profil_roles",
                     required: false,
                  },
               ],
            },
            //   ,
            //   {
            //     model: Utilisateur_roles,
            //     as: "utilisateur_roles",
            //     attributes: ["ID_ROLE", "CAN_READ", "CAN_WRITE"],
            //     required: false,
            //     separate: true, // Sépare les résultats des rôles de l'utilisateur
            //     order: [['ID_ROLE', 'ASC']] // Ordonne par l'ID_ROLE du modèle Utilisateur_roles
            //   }
         ],
         order: [[{ model: Profil, as: "profil" }, { model: Profil_roles, as: "profil_roles" }, "ID_ROLE", "ASC"]],
      })
      if (userObject) {
         const user = userObject.toJSON()
         let userRoles
         const roles = user.profil.profil_roles.map((role) => {
            return role
         })
         userRoles = {
            ...user,
            profil: {
               ...user.profil,
               profil_roles: roles,
            },
         }
         // eslint-disable-next-line no-unused-vars
         const { PASSWORD, utilisateur_roles, ...other } = userRoles
         res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "L'utilisateur est trouvé",
            result: other,
         })
      } else {
         res.status(RESPONSE_CODES.NOT_FOUND).json({
            statusCode: RESPONSE_CODES.NOT_FOUND,
            httpStatus: RESPONSE_STATUS.NOT_FOUND,
            message: "Utilisateur non trouvée",
         })
      }
   } catch (error) {
      console.log(error)
      res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
         statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
         httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
         message: "Erreur interne du serveur, réessayer plus tard",
      })
   }
}

/**
 *
 * @param {string} numero le numéro de téléphone à envoyer le numéro
 * @returns {string} le code envoyer sur ce numero
 */
const sendConfirmationCode = (numero, email, __, baseUrl) => {
   /**
    * Représente les deux chiffres qui commencent sur un numéro burundais
    *  @type  {string}
    */
   const phoneStart = numero.substring(0, 2)

   // si c'est un numéro econet ou lumitel on génère un code aléatoire, sinon on ajoute le code 1234 par défault
   var code = generateCode(4)
   if ([...ECONET_PHONE_NUMBER_STARTS, ...LUMITEL_PHONE_NUMBER_STARTS].includes(phoneStart)) {
      //         code = generateCode(4)
      sendSMS(numero, `${code} est votre code de confirmation sur Wasili`)
   } else {
      //         code = DEFAULT_CODE
   }
   if (email) {
      //   code = generateCode(4)
      sendMail(
         {
            to: email,
            subject: __("auth_admin.controller.checkCompteOblier.Confirmationcompte"),
         },
         "confirm_email",
         { code, __, baseUrl },
      )
   }
   return code
}

/**
 * Permet de recuperer les info de l utilisateur lors de reinitialiser le mot de passe
 * @author NIREMA ELOGE <nirema.eloge@mediabox.bi>
 * @param {express.Request} res
 * @param {express.Response} res
 */
const getInfoByEmail = async (req, res) => {
   try {
      const { email } = req.body
      const validation = new Validation(
         req.body,
         {
            email: {
               required: true,
            },
         },
         {
            email: {
               required: "L'email est obligatoire",
            },
         },
      )
      await validation.run()
      const isValid = await validation.isValidate()
      const errors = await validation.getErrors()
      if (!isValid) {
         return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
            statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
            httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
            message: "Probleme de validation des donnees",
            result: errors,
         })
      }
      const userObject = await Utilisateurs.findOne({
         where: { EMAIL: email },
         attributes: ["ID_UTILISATEUR", "NOM", "PRENOM", "TELEPHONE", "EMAIL", "IS_ACTIF"],
      })

      if (userObject) {
         const user = userObject.toJSON()

         const numero = user.TELEPHONE
         const phoneStart = numero.substring(0, 2)
         var code = generateCode(4)
         if ([...ECONET_PHONE_NUMBER_STARTS, ...LUMITEL_PHONE_NUMBER_STARTS].includes(phoneStart)) {
            //         code = generateCode(4)
            sendSMS(numero, `${code} est votre code de confirmation sur Wasili`)
         }
         const checkotp_exist = await Utilisateurs_otp_generates.findOne({
            where: { ID_UTILISATEUR: user.ID_UTILISATEUR },
            attributes: ["ID_UTILISATEUR_OTP", "ID_UTILISATEUR", "OTP", "IS_OTP_CONFIRMED", "DATE_INSERTION"],
         })
         if (checkotp_exist) {
            const userOtp = checkotp_exist.toJSON()
            await Utilisateurs_otp_generates.update(
               {
                  OTP: code,
                  IS_OTP_CONFIRMED: 0,
               },
               {
                  where: {
                     ID_UTILISATEUR: userOtp.ID_UTILISATEUR,
                  },
               },
            )
         } else {
            Utilisateurs_otp_generates.create({
               ID_UTILISATEUR: user.ID_UTILISATEUR,
               OTP: code,
               IS_OTP_CONFIRMED: 0,
            })
         }
         // return console.log(user);
         res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Votre OTP est cree avec succès",
            result: user,
         })
      } else {
         validation.setError("main", "Email incorrect")
         const errors = await validation.getErrors()
         res.status(RESPONSE_CODES.NOT_FOUND).json({
            statusCode: RESPONSE_CODES.NOT_FOUND,
            httpStatus: RESPONSE_STATUS.NOT_FOUND,
            message: "Email incorrect",
            result: errors,
         })
      }
   } catch (error) {
      console.log(error)
      res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
         statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
         httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
         message: "Erreur interne du serveur, réessayer plus tard",
      })
   }
}

/**
 * Permet de recuperer les info de l utilisateur lors de reinitialiser le mot de passe
 * @author NIREMA ELOGE <nirema.eloge@mediabox.bi>
 * @param {express.Request} res
 * @param {express.Response} res
 */
const checkOTP = async (req, res) => {
   try {
      const { OTP, ID_UTILISATEUR } = req.body
      // return console.log(OTP);
      const validation = new Validation(req.body, {
         OTP: {
            required: "L'otp est obligatoire",
         },
      })
      await validation.run()
      const isValid = await validation.isValidate()
      const errors = await validation.getErrors()
      if (!isValid) {
         return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
            statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
            httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
            message: "Probleme de validation des donnees",
            result: errors,
         })
      }
      const userObject = await Utilisateurs_otp_generates.findOne({
         where: { ID_UTILISATEUR: ID_UTILISATEUR },
         attributes: ["ID_UTILISATEUR_OTP", "ID_UTILISATEUR", "OTP", "IS_OTP_CONFIRMED"],
      })
      if (userObject) {
         const user = userObject.toJSON()
         if (user.OTP == OTP) {
            await Utilisateurs_otp_generates.update(
               {
                  IS_OTP_CONFIRMED: 1,
               },
               {
                  where: {
                     ID_UTILISATEUR: user.ID_UTILISATEUR,
                  },
               },
            )
            res.status(RESPONSE_CODES.CREATED).json({
               statusCode: RESPONSE_CODES.CREATED,
               httpStatus: RESPONSE_STATUS.CREATED,
               message: "Votre OTP ",
               result: user,
            })
         } else {
            validation.setError("main", "Code invalide")
            const errors = await validation.getErrors()
            res.status(RESPONSE_CODES.NOT_FOUND).json({
               statusCode: RESPONSE_CODES.NOT_FOUND,
               httpStatus: RESPONSE_STATUS.NOT_FOUND,
               message: "Utilisateur n'existe pas",
               result: errors,
            })
         }
      } else {
         validation.setError("main", "Votre compte n'existe pas")
         const errors = await validation.getErrors()
         res.status(RESPONSE_CODES.NOT_FOUND).json({
            statusCode: RESPONSE_CODES.NOT_FOUND,
            httpStatus: RESPONSE_STATUS.NOT_FOUND,
            message: "Utilisateur n'existe pas",
            result: errors,
         })
      }
   } catch (error) {
      console.log(error)
      res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
         statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
         httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
         message: "Erreur interne du serveur, réessayer plus tard",
      })
   }
}

/**
 * Permet de modifier le mot de passe
 * @param {express.Request} req
 * @param {express.Response} res
 * @author ELOGE<nirema.eloge@mediabox.bi>
 * @date 2201/2024
 */
const changePWD = async (req, res) => {
   try {
      const { newPwd, confirmPwd, id } = req.body
      const validation = new Validation(
         req.body,
         {
            newPwd: {
               length: [4, 16],
               required: true,
            },
            confirmPwd: {
               length: [4, 16],
               required: true,
            },
         },
         {
            newPwd: {
               required: "Le mot de passe est obligatoire",
            },
            confirmPwd: {
               required: "Le mot de passe est obligatoire",
            },
         },
      )
      await validation.run()
      const isValid = await validation.isValidate()
      const errors = await validation.getErrors()
      if (!isValid) {
         return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
            statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
            httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
            message: "Probleme de validation des donnees",
            result: errors,
         })
      }

      if (newPwd == confirmPwd) {
         const salt = await bcrypt.genSalt()
         const PASSWORD = await bcrypt.hash(newPwd, salt)
         await Utilisateurs.update(
            {
               PASSWORD,
            },
            {
               where: {
                  ID_UTILISATEUR: id,
               },
            },
         )
         res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Vous êtes connecté avec succès",
            // result: {
            //   user
            // }
         })
      } else {
         validation.setError("main", "Deux mot de passe ne sont pas identiques")
         const errors = await validation.getErrors()
         res.status(RESPONSE_CODES.BADREQUEST).json({
            statusCode: RESPONSE_CODES.BADREQUEST,
            httpStatus: RESPONSE_STATUS.BADREQUEST,
            message: "Deux mot de passe ne sont pas identiques",
            result: errors,
         })
      }
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
   login,
   logout,
   getNewAccessToken,
   findRolesByProfil,
   findUserInfo,
   getInfoByEmail,
   sendConfirmationCode,
   checkOTP,
   changePWD,
}
